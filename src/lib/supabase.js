import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || ''
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const hasSupabase = !!(SUPABASE_URL && SUPABASE_ANON)

const TOKEN_KEY = 'ckd_patient_token'

function readToken() {
  try { return localStorage.getItem(TOKEN_KEY) || null }
  catch { return null }
}

function make(token) {
  if (!hasSupabase) return null
  const headers = token ? { 'x-patient-token': token } : {}
  return createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: false },
    global: { headers },
  })
}

let _token = readToken()
let _client = make(_token)

export function getSupabase() { return _client }

export function getPatientToken() { return _token }

export function setPatientToken(token) {
  _token = token || null
  try {
    if (_token) localStorage.setItem(TOKEN_KEY, _token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* ignore storage errors */ }
  _client = make(_token)
}
