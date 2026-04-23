import {
  json, originAllowed, readJson, sbRest,
  verifyDoctorToken, getBearerToken,
} from './_utils.js'

export const config = { runtime: 'edge' }

const MAX_NOTE_LEN = 2000

async function requireDoctor(req) {
  const token = getBearerToken(req)
  const payload = await verifyDoctorToken(token)
  if (!payload) { const e = new Error('unauthorized'); e.status = 401; throw e }
  return payload
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 })
  if (!originAllowed(req))       return json({ error: 'forbidden_origin' }, { status: 403 })
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ error: 'supabase_not_configured' }, { status: 500 })
  }

  try {
    await requireDoctor(req)

    if (req.method === 'GET') {
      const url    = new URL(req.url)
      const action = url.searchParams.get('action')

      if (action === 'patients') {
        const rows = await sbRest(
          '/rest/v1/patients?select=id,name,surname,phone,ckd_stage,has_dm,has_htn,risk_level,alb_level,is_pilot,registered_at,last_active&order=registered_at.desc',
        )
        return json(rows || [])
      }
      if (action === 'logs') {
        const id   = url.searchParams.get('id')
        const days = Math.max(1, Math.min(90, Number(url.searchParams.get('days') || 7)))
        if (!id) return json({ error: 'missing_id' }, { status: 400 })
        const since = new Date(Date.now() - days * 86400000).toISOString()
        const rows = await sbRest(
          `/rest/v1/food_logs?patient_id=eq.${encodeURIComponent(id)}&logged_at=gte.${since}&order=logged_at.desc`,
        )
        return json(rows || [])
      }
      if (action === 'notes') {
        const id = url.searchParams.get('id')
        if (!id) return json({ error: 'missing_id' }, { status: 400 })
        const rows = await sbRest(
          `/rest/v1/doctor_notes?patient_id=eq.${encodeURIComponent(id)}&order=created_at.desc`,
        )
        return json(rows || [])
      }
      return json({ error: 'unknown_action' }, { status: 400 })
    }

    if (req.method === 'POST') {
      const body   = await readJson(req, 16 * 1024)
      const action = body?.action

      if (action === 'add_note') {
        const id   = body?.patient_id
        const note = (typeof body?.note === 'string' ? body.note : '').trim()
        if (!id || !note) return json({ error: 'missing_fields' }, { status: 400 })
        if (note.length > MAX_NOTE_LEN) return json({ error: 'note_too_long' }, { status: 400 })
        const rows = await sbRest('/rest/v1/doctor_notes', {
          method: 'POST',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ patient_id: id, note }),
        })
        return json(Array.isArray(rows) ? rows[0] : rows)
      }
      return json({ error: 'unknown_action' }, { status: 400 })
    }

    return json({ error: 'method_not_allowed' }, { status: 405 })
  } catch (e) {
    return json({ error: e.message || 'error' }, { status: e.status || 500 })
  }
}
