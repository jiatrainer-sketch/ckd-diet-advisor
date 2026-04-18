import { supabase, hasSupabase } from './supabase'

// ── ดึง/สร้าง patient ID จาก localStorage ──────────────────────────────
export function getLocalPatientId() {
  return localStorage.getItem('ckd_patient_id') || null
}

export function setLocalPatientId(id) {
  localStorage.setItem('ckd_patient_id', id)
}

// ── ลงทะเบียนคนไข้ใหม่ ─────────────────────────────────────────────────
export async function registerPatient({ name, surname, phone, ckdStage, hasDm, hasHtn, riskLevel, albLevel, isPilot }) {
  if (!hasSupabase) return { error: 'no_supabase' }
  const { data, error } = await supabase
    .from('patients')
    .insert([{
      name, surname, phone,
      ckd_stage:    ckdStage || null,
      has_dm:       hasDm || false,
      has_htn:      hasHtn || false,
      risk_level:   riskLevel || null,
      alb_level:    albLevel ? parseInt(albLevel) : null,
      pdpa_consent: true,
      is_pilot:     isPilot || false,
    }])
    .select()
    .single()
  if (error) return { error }
  setLocalPatientId(data.id)
  return { data }
}

// ── ดึงข้อมูลคนไข้ ────────────────────────────────────────────────────
export async function getPatient(id) {
  if (!hasSupabase || !id) return null
  const { data } = await supabase.from('patients').select('*').eq('id', id).single()
  return data
}

// ── localStorage fallback helpers ────────────────────────────────────
function localKey(patientId, date) {
  return `ckd_diary_${patientId}_${date}`
}
function getLocalLogs(patientId) {
  const today = new Date().toISOString().split('T')[0]
  try { return JSON.parse(localStorage.getItem(localKey(patientId, today)) || '[]') } catch { return [] }
}
function saveLocalLog(patientId, entry) {
  const today = new Date().toISOString().split('T')[0]
  const logs = getLocalLogs(patientId)
  logs.push({ ...entry, id: Date.now().toString(), logged_at: new Date().toISOString() })
  localStorage.setItem(localKey(patientId, today), JSON.stringify(logs))
  return logs[logs.length - 1]
}

// ── บันทึกอาหาร ───────────────────────────────────────────────────────
export async function logFood({ patientId, mealType, foodName, portionGrams, potassium, phosphorus, sodium, protein, calories, safety, aiAnalysis, photoUsed }) {
  if (!patientId) return { error: 'no_patient' }

  const entry = {
    patient_id: patientId, meal_type: mealType, food_name: foodName,
    portion_grams: portionGrams||100, potassium: potassium||0,
    phosphorus: phosphorus||0, sodium: sodium||0, protein: protein||0,
    calories: calories||0, safety: safety||'unknown',
    ai_analysis: aiAnalysis||null, photo_used: photoUsed||false,
  }

  // ถ้ามี Supabase ใช้ cloud, ถ้าไม่มีใช้ localStorage
  if (hasSupabase) {
    const { data, error } = await supabase.from('food_logs').insert([entry]).select().single()
    if (!error) {
      // update last_active
      await supabase.from('patients').update({ last_active: new Date().toISOString() }).eq('id', patientId)
      return { data }
    }
  }
  // fallback localStorage
  return { data: saveLocalLog(patientId, entry) }
}

// ── ดึง food logs รายวัน ──────────────────────────────────────────────
export async function getTodayLogs(patientId) {
  if (!patientId) return []

  if (hasSupabase) {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('food_logs').select('*').eq('patient_id', patientId)
      .gte('logged_at', today + 'T00:00:00')
      .lte('logged_at', today + 'T23:59:59')
      .order('logged_at', { ascending: true })
    if (data) return data
  }
  // fallback localStorage
  return getLocalLogs(patientId)
}

// ── Photo quota ───────────────────────────────────────────────────────
export const DAILY_PHOTO_LIMIT = 5  // pilot: 5 รูป/วัน

export async function getPhotoCount(patientId) {
  if (!hasSupabase || !patientId) return 0
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('photo_quota')
    .select('count')
    .eq('patient_id', patientId)
    .eq('quota_date', today)
    .single()
  return data?.count || 0
}

export async function incrementPhotoCount(patientId) {
  if (!hasSupabase || !patientId) return
  const today = new Date().toISOString().split('T')[0]
  await supabase.rpc('increment_photo_quota', { p_patient_id: patientId, p_date: today })
}

// ── Doctor: ดึงคนไข้ทั้งหมด ───────────────────────────────────────────
export async function getAllPatients() {
  if (!hasSupabase) return []
  const { data } = await supabase
    .from('patients')
    .select('*')
    .order('registered_at', { ascending: false })
  return data || []
}

// ── Doctor: ดึง logs คนไข้ 7 วันล่าสุด ──────────────────────────────
export async function getPatientLogs(patientId, days = 7) {
  if (!hasSupabase || !patientId) return []
  const since = new Date()
  since.setDate(since.getDate() - days)
  const { data } = await supabase
    .from('food_logs')
    .select('*')
    .eq('patient_id', patientId)
    .gte('logged_at', since.toISOString())
    .order('logged_at', { ascending: false })
  return data || []
}

// ── Doctor: บันทึก note ───────────────────────────────────────────────
export async function addDoctorNote(patientId, note) {
  if (!hasSupabase) return
  await supabase.from('doctor_notes').insert([{ patient_id: patientId, note }])
}

export async function getDoctorNotes(patientId) {
  if (!hasSupabase) return []
  const { data } = await supabase
    .from('doctor_notes')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}
