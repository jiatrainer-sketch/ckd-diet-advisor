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
export { getPatientToken }

// ── register (via SECURITY DEFINER RPC) ───────────────────────────────
export async function registerPatient({
  name, surname, phone, ckdStage,
  hasDm, hasHtn, riskLevel, albLevel, isPilot,
}) {
  if (!hasSupabase) return { error: 'no_supabase' }
  const sb = getSupabase()

  const { data, error } = await sb.rpc('register_patient', {
    p_name:       (name || '').trim(),
    p_surname:    (surname || '').trim(),
    p_phone:      (phone || '').trim() || null,
    p_ckd_stage:  ckdStage || null,
    p_has_dm:     !!hasDm,
    p_has_htn:    !!hasHtn,
    p_risk_level: riskLevel || null,
    p_alb_level:  albLevel != null && albLevel !== '' ? parseInt(albLevel, 10) : null,
    p_is_pilot:   !!isPilot,
  })

  if (error) return { error: error.message || 'register_failed' }

  const row = Array.isArray(data) ? data[0] : data
  if (!row?.id || !row?.claim_token) return { error: 'register_failed' }

  setLocalPatientId(row.id)
  setPatientToken(row.claim_token)

  return {
    data: {
      id:          row.id,
      name:        (name || '').trim(),
      surname:     (surname || '').trim(),
      phone:       (phone || '').trim() || null,
      ckd_stage:   ckdStage || null,
      has_dm:      !!hasDm,
      has_htn:     !!hasHtn,
      is_pilot:    !!isPilot,
      risk_level:  riskLevel || null,
    },
  }
}

// ── get patient ────────────────────────────────────────────────────────
export async function getPatient(id) {
  if (!hasSupabase || !id) return null
  const sb = getSupabase()
  const { data, error } = await sb.from('patients').select('*').eq('id', id).maybeSingle()
  if (error) {
    console.warn('[getPatient] supabase error:', error.message)
    return null
  }
  return data
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

export async function getPhotoCount(patientId) {
  if (!hasSupabase || !patientId || !getPatientToken()) return 0
  const sb = getSupabase()
  const { data, error } = await sb.from('photo_quota').select('count')
    .eq('patient_id', patientId)
    .eq('quota_date', localDateStr())
    .maybeSingle()
  if (error) {
    console.warn('[getPhotoCount] supabase error:', error.message)
    return 0
  }
  return data?.count || 0
}

export async function incrementPhotoCount(patientId) {
  if (!hasSupabase || !patientId || !getPatientToken()) return null
  const sb = getSupabase()
  const { data, error } = await sb.rpc('increment_photo_quota', {
    p_patient_id: patientId,
    p_date:       localDateStr(),
  })
  if (error) {
    console.warn('[incrementPhotoCount] rpc error:', error.message)
    return null
  }
  return data
}
