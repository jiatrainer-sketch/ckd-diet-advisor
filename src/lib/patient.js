import { getSupabase, hasSupabase, setPatientToken, getPatientToken } from './supabase'

// ── Local date helpers (timezone-aware) ───────────────────────────────
function localDateStr(d = new Date()) {
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}
function todayRangeIso() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  return { startIso: start.toISOString(), endIso: end.toISOString() }
}

// ── patient id & claim token ───────────────────────────────────────────
export function getLocalPatientId() {
  try { return localStorage.getItem('ckd_patient_id') || null }
  catch { return null }
}
export function setLocalPatientId(id) {
  try { localStorage.setItem('ckd_patient_id', id) }
  catch { /* ignore */ }
}
export function clearLocalPatient() {
  try { localStorage.removeItem('ckd_patient_id') }
  catch { /* ignore */ }
  setPatientToken(null)
}
export { getPatientToken, hasSupabase }

const LOCAL_PATIENT_KEY = 'ckd_patient_local'
function readLocalPatient() {
  try { return JSON.parse(localStorage.getItem(LOCAL_PATIENT_KEY) || 'null') }
  catch { return null }
}
function writeLocalPatient(p) {
  try { localStorage.setItem(LOCAL_PATIENT_KEY, JSON.stringify(p)) }
  catch { /* ignore */ }
}

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  // RFC 4122 v4 fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

// ── register (Supabase RPC when configured, else local-only) ──────────
export async function registerPatient({
  name, surname, phone, ckdStage,
  hasDm, hasHtn, riskLevel, albLevel, isPilot,
}) {
  const cleanName    = (name || '').trim()
  const cleanSurname = (surname || '').trim()
  const cleanPhone   = (phone || '').trim() || null
  const alb = albLevel != null && albLevel !== '' ? parseInt(albLevel, 10) : null

  if (hasSupabase) {
    const sb = getSupabase()
    const { data, error } = await sb.rpc('register_patient', {
      p_name:       cleanName,
      p_surname:    cleanSurname,
      p_phone:      cleanPhone,
      p_ckd_stage:  ckdStage || null,
      p_has_dm:     !!hasDm,
      p_has_htn:    !!hasHtn,
      p_risk_level: riskLevel || null,
      p_alb_level:  alb,
      p_is_pilot:   !!isPilot,
    })

    if (!error) {
      const row = Array.isArray(data) ? data[0] : data
      if (row?.id && row?.claim_token) {
        setLocalPatientId(row.id)
        setPatientToken(row.claim_token)
        const patient = {
          id:         row.id,
          name:       cleanName,
          surname:    cleanSurname,
          phone:      cleanPhone,
          ckd_stage:  ckdStage || null,
          has_dm:     !!hasDm,
          has_htn:    !!hasHtn,
          is_pilot:   !!isPilot,
          risk_level: riskLevel || null,
          alb_level:  alb,
        }
        writeLocalPatient(patient)
        return { data: patient }
      }
    }
    // Supabase configured but call failed → fall through to offline register
    console.warn('[registerPatient] falling back to offline:', error?.message)
  }

  // Offline register: generate local UUID, persist to localStorage only.
  const id = randomId()
  const patient = {
    id,
    name:       cleanName,
    surname:    cleanSurname,
    phone:      cleanPhone,
    ckd_stage:  ckdStage || null,
    has_dm:     !!hasDm,
    has_htn:    !!hasHtn,
    is_pilot:   !!isPilot,
    risk_level: riskLevel || null,
    alb_level:  alb,
    registered_at: new Date().toISOString(),
    last_active:   new Date().toISOString(),
    _offline:   true,
  }
  setLocalPatientId(id)
  writeLocalPatient(patient)
  return { data: patient, offline: true }
}

// ── get patient (cloud if configured, else local) ────────────────────
export async function getPatient(id) {
  if (!id) return null
  if (hasSupabase && getPatientToken()) {
    const sb = getSupabase()
    const { data, error } = await sb.from('patients').select('*').eq('id', id).maybeSingle()
    if (!error && data) return data
    if (error) console.warn('[getPatient] supabase error:', error.message)
  }
  const local = readLocalPatient()
  if (local && local.id === id) return local
  return null
}

// ── localStorage fallback helpers ─────────────────────────────────────
function localKey(patientId, date) { return `ckd_diary_${patientId}_${date}` }
function getLocalLogs(patientId) {
  const today = localDateStr()
  try { return JSON.parse(localStorage.getItem(localKey(patientId, today)) || '[]') }
  catch { return [] }
}
function saveLocalLog(patientId, entry) {
  const today = localDateStr()
  const logs = getLocalLogs(patientId)
  logs.push({ ...entry, id: Date.now().toString(), logged_at: new Date().toISOString() })
  try { localStorage.setItem(localKey(patientId, today), JSON.stringify(logs)) }
  catch { /* storage may be full; still return the entry in memory */ }
  return logs[logs.length - 1]
}

// ── log food ──────────────────────────────────────────────────────────
export async function logFood({
  patientId, mealType, foodName, portionGrams, perServing,
  potassium, phosphorus, sodium, protein, calories,
  safety, aiAnalysis, photoUsed,
}) {
  if (!patientId) return { error: 'no_patient' }

  const entry = {
    patient_id:    patientId,
    meal_type:     mealType,
    food_name:     foodName,
    portion_grams: perServing ? null : (portionGrams || 100),
    per_serving:   !!perServing,
    potassium:     potassium  || 0,
    phosphorus:    phosphorus || 0,
    sodium:        sodium     || 0,
    protein:       protein    || 0,
    calories:      calories   || 0,
    safety:        safety     || 'unknown',
    ai_analysis:   aiAnalysis || null,
    photo_used:    !!photoUsed,
  }

  if (hasSupabase && getPatientToken()) {
    const sb = getSupabase()
    const { data, error } = await sb.from('food_logs').insert([entry]).select().single()
    if (!error) {
      sb.from('patients').update({ last_active: new Date().toISOString() }).eq('id', patientId)
        .then(() => {}, () => {})
      return { data }
    }
    console.warn('[logFood] cloud save failed, using local:', error.message)
    return { data: saveLocalLog(patientId, entry), offline: true, error: error.message }
  }

  return { data: saveLocalLog(patientId, entry), offline: true }
}

// ── today's logs ──────────────────────────────────────────────────────
export async function getTodayLogs(patientId) {
  if (!patientId) return []

  if (hasSupabase && getPatientToken()) {
    const { startIso, endIso } = todayRangeIso()
    const sb = getSupabase()
    const { data, error } = await sb.from('food_logs').select('*')
      .eq('patient_id', patientId)
      .gte('logged_at', startIso)
      .lte('logged_at', endIso)
      .order('logged_at', { ascending: true })
    if (!error && data) return data
    if (error) console.warn('[getTodayLogs] supabase error:', error.message)
  }
  return getLocalLogs(patientId)
}

// ── photo quota ───────────────────────────────────────────────────────
export const DAILY_PHOTO_LIMIT = 5

function localQuotaKey() { return `ckd_photo_${localDateStr()}` }
function readLocalQuota() {
  try { return parseInt(localStorage.getItem(localQuotaKey()) || '0', 10) || 0 }
  catch { return 0 }
}
function bumpLocalQuota() {
  try {
    const next = readLocalQuota() + 1
    localStorage.setItem(localQuotaKey(), String(next))
    return next
  } catch { return null }
}

export async function getPhotoCount(patientId) {
  if (!patientId) return 0
  if (hasSupabase && getPatientToken()) {
    const sb = getSupabase()
    const { data, error } = await sb.from('photo_quota').select('count')
      .eq('patient_id', patientId)
      .eq('quota_date', localDateStr())
      .maybeSingle()
    if (!error) return data?.count || 0
    console.warn('[getPhotoCount] supabase error:', error.message)
  }
  return readLocalQuota()
}

export async function incrementPhotoCount(patientId) {
  if (!patientId) return null
  if (hasSupabase && getPatientToken()) {
    // server-side /api/analyze already increments when service_role is set;
    // this is a no-op for cloud mode so we don't double-count.
    return null
  }
  return bumpLocalQuota()
}
