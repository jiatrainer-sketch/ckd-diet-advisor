import { json, originAllowed, readJson, signDoctorToken, timingSafeEqual } from './_utils.js'

export const config = { runtime: 'edge' }

// Simple in-memory bucket (per edge instance). Not a substitute for a real
// rate limiter but slows down brute-force on a single instance.
const BUCKET = new Map()
const WINDOW_MS = 10 * 60 * 1000   // 10 minutes
const MAX_ATTEMPTS = 8

function fingerprint(req) {
  return req.headers.get('x-forwarded-for')
       || req.headers.get('cf-connecting-ip')
       || req.headers.get('x-real-ip')
       || 'unknown'
}

function recordAttempt(key, ok) {
  const now = Date.now()
  const entry = BUCKET.get(key) || { count: 0, first: now }
  if (now - entry.first > WINDOW_MS) { entry.count = 0; entry.first = now }
  entry.count += ok ? 0 : 1
  BUCKET.set(key, entry)
  return entry.count
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 })
  if (req.method !== 'POST')   return json({ error: 'method_not_allowed' }, { status: 405 })
  if (!originAllowed(req))     return json({ error: 'forbidden_origin' }, { status: 403 })

  const pinExpected = process.env.DOCTOR_PIN
  const secret     = process.env.DOCTOR_SECRET
  if (!pinExpected || !secret || secret.length < 16) {
    return json({ error: 'doctor_auth_not_configured' }, { status: 500 })
  }

  const key = fingerprint(req)
  const existing = BUCKET.get(key)
  if (existing && existing.count >= MAX_ATTEMPTS && Date.now() - existing.first < WINDOW_MS) {
    return json({ error: 'too_many_attempts' }, { status: 429 })
  }

  let body
  try { body = await readJson(req, 4 * 1024) }
  catch (e) { return json({ error: e.message }, { status: e.status || 400 }) }

  const pin = typeof body?.pin === 'string' ? body.pin : ''
  if (!timingSafeEqual(pin, pinExpected)) {
    recordAttempt(key, false)
    return json({ error: 'invalid_pin' }, { status: 401 })
  }

  // reset bucket on success
  BUCKET.delete(key)

  try {
    const token = await signDoctorToken()
    return json({ token, expiresIn: 8 * 3600 })
  } catch {
    return json({ error: 'token_sign_failed' }, { status: 500 })
  }
}
