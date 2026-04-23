// Shared helpers for /api/* edge functions.

export const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

export function json(body, init = {}) {
  const headers = { 'content-type': 'application/json', ...(init.headers || {}) }
  return new Response(JSON.stringify(body), { ...init, headers })
}

export function originAllowed(req) {
  if (ALLOWED_ORIGINS.length === 0) return true // allow all when unset (dev)
  const origin = req.headers.get('origin') || ''
  const referer = req.headers.get('referer') || ''
  return ALLOWED_ORIGINS.some(o => origin === o || referer.startsWith(o))
}

// Read JSON with a hard max-body limit (bytes). Throws on overflow/invalid.
export async function readJson(req, maxBytes = 8 * 1024 * 1024) {
  const len = Number(req.headers.get('content-length') || 0)
  if (len && len > maxBytes) {
    const err = new Error('payload_too_large')
    err.status = 413
    throw err
  }
  const text = await req.text()
  if (text.length > maxBytes) {
    const err = new Error('payload_too_large')
    err.status = 413
    throw err
  }
  try {
    return JSON.parse(text)
  } catch {
    const err = new Error('invalid_json')
    err.status = 400
    throw err
  }
}

// Supabase REST call using service role (bypasses RLS). Returns parsed JSON.
export async function sbRest(path, init = {}) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    const err = new Error('supabase_not_configured')
    err.status = 500
    throw err
  }
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...(init.headers || {}),
  }
  const res = await fetch(`${url}${path}`, { ...init, headers })
  const bodyText = await res.text()
  let data = null
  if (bodyText) {
    try { data = JSON.parse(bodyText) } catch { data = bodyText }
  }
  if (!res.ok) {
    const err = new Error(typeof data === 'string' ? data : (data?.message || 'supabase_error'))
    err.status = res.status
    throw err
  }
  return data
}

// ── Doctor token: HMAC-signed, stateless, short-lived ────────────────────────
const enc = new TextEncoder()
const b64url = (bytes) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const fromB64url = (s) => {
  const pad = '='.repeat((4 - (s.length % 4)) % 4)
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad
  const str = atob(b64)
  const bytes = new Uint8Array(str.length)
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i)
  return bytes
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign', 'verify'],
  )
}

export async function signDoctorToken(ttlMs = 8 * 3600 * 1000) {
  const secret = process.env.DOCTOR_SECRET
  if (!secret || secret.length < 16) throw new Error('doctor_secret_missing')
  const payload = { role: 'doctor', exp: Date.now() + ttlMs }
  const body = b64url(enc.encode(JSON.stringify(payload)))
  const key = await hmacKey(secret)
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body))
  return `${body}.${b64url(sig)}`
}

export async function verifyDoctorToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null
  const secret = process.env.DOCTOR_SECRET
  if (!secret) return null
  const [body, sig] = token.split('.')
  const key = await hmacKey(secret)
  const ok = await crypto.subtle.verify('HMAC', key, fromB64url(sig), enc.encode(body))
  if (!ok) return null
  let payload
  try { payload = JSON.parse(new TextDecoder().decode(fromB64url(body))) }
  catch { return null }
  if (!payload?.exp || payload.exp < Date.now()) return null
  if (payload.role !== 'doctor') return null
  return payload
}

export function getBearerToken(req) {
  const h = req.headers.get('authorization') || ''
  const m = h.match(/^Bearer\s+(.+)$/i)
  return m ? m[1] : null
}

// Constant-time string compare (for PIN check).
export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
