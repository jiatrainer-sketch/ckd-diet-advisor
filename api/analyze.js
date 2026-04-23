import { json, originAllowed, readJson, sbRest } from './_utils.js'

export const config = { runtime: 'edge' }

const MAX_IMAGE_BYTES = 6 * 1024 * 1024   // 6 MB raw base64 payload
const DAILY_PHOTO_LIMIT = 5

const PROMPTS = {
  food: `คุณเป็นนักโภชนาการผู้เชี่ยวชาญโรคไต (CKD) ที่พูดภาษาไทย

วิเคราะห์อาหารในภาพนี้และตอบเป็น JSON เท่านั้น (ไม่มีข้อความอื่น):

{
  "name": "ชื่ออาหาร",
  "category": "ประเภท (ผัก/ผลไม้/เนื้อสัตว์/แปรรูป/เครื่องดื่ม/อื่นๆ)",
  "nutrients_per_100g": {
    "k": 0,
    "p": 0,
    "na": 0,
    "protein": 0,
    "kcal": 0
  },
  "k_level": "low/medium/high",
  "p_level": "low/medium/high",
  "na_level": "low/medium/high",
  "safety": {
    "stage_early": "safe/caution/danger",
    "stage_late": "safe/caution/danger",
    "stage_hd": "safe/caution/danger"
  },
  "tips": ["คำแนะนำ 2-3 ข้อเป็นภาษาไทย"],
  "warning": "คำเตือนสำคัญ (ถ้ามี) หรือ null",
  "tip_easy": "คำจำง่ายสั้นๆ 1 ประโยค"
}

ใช้ค่าจากฐานข้อมูลโภชนาการไทยหรือประมาณค่าที่สมเหตุสมผล ถ้าไม่ใช่อาหาร ให้ name = "ไม่ใช่อาหาร"`,

  label: `คุณเป็นเภสัชกรและนักโภชนาการผู้เชี่ยวชาญโรคไต (CKD) ที่พูดภาษาไทย

วิเคราะห์ฉลากผลิตภัณฑ์/อาหารเสริมในภาพนี้ และตอบเป็น JSON เท่านั้น:

{
  "product_name": "ชื่อผลิตภัณฑ์",
  "type": "ประเภท (อาหารเสริม/ยา/อาหาร/เครื่องดื่ม)",
  "dangerous_ingredients": [
    {
      "name": "ชื่อส่วนผสมอันตราย",
      "reason": "เหตุผลที่อันตรายสำหรับคนไต",
      "severity": "high/medium/low"
    }
  ],
  "nutrients_per_serving": {
    "k": 0,
    "p": 0,
    "na": 0,
    "protein": 0,
    "ca": 0
  },
  "overall_safety": "safe/caution/danger",
  "verdict": "สรุปสั้นๆ ภาษาไทย 1-2 ประโยค",
  "flags": ["ตรวจพบ phosphate/KCl/collagen/calcium เป็น flag แยกกัน"],
  "recommendation": "คำแนะนำสำหรับคนไต"
}

ให้ตรวจหาโดยเฉพาะ: phosphate, potassium, KCl, collagen, calcium carbonate, calcium citrate, vitamin K, สมุนไพรที่อันตรายต่อไต
ถ้าอ่านฉลากไม่ได้ชัดเจน ให้ verdict = "ภาพไม่ชัด กรุณาถ่ายใหม่"`,

  lab: `คุณเป็นแพทย์โรคไต (Nephrologist) ผู้เชี่ยวชาญที่พูดภาษาไทย

อ่านผลเลือด/Lab ในภาพนี้ และตอบเป็น JSON เท่านั้น:

{
  "lab_date": "วันที่ผล Lab (ถ้ามี) หรือ null",
  "values": {
    "k": { "value": 0, "unit": "mEq/L", "normal_range": "3.5-5.0", "status": "normal/low/high/critical" },
    "p": { "value": 0, "unit": "mg/dL", "normal_range": "2.5-4.5", "status": "normal/low/high/critical" },
    "ca": { "value": 0, "unit": "mg/dL", "normal_range": "8.5-10.5", "status": "normal/low/high/critical" },
    "hb": { "value": 0, "unit": "g/dL", "normal_range": "12-16", "status": "normal/low/high/critical" },
    "cr": { "value": 0, "unit": "mg/dL", "normal_range": "0.6-1.2", "status": "normal/low/high/critical" },
    "bun": { "value": 0, "unit": "mg/dL", "normal_range": "7-25", "status": "normal/low/high/critical" },
    "na": { "value": 0, "unit": "mEq/L", "normal_range": "136-145", "status": "normal/low/high/critical" }
  },
  "alerts": ["ค่าที่ผิดปกติและต้องระวัง"],
  "diet_implications": {
    "k_restriction": "none/moderate/strict",
    "p_restriction": "none/moderate/strict",
    "fluid_restriction": "none/moderate/strict"
  },
  "summary": "สรุปภาษาไทยสั้นๆ สำหรับคนไข้ ไม่ใช้ศัพท์แพทย์",
  "urgent": false
}

ถ้าค่าใดอ่านไม่ได้ให้ value = null ถ้าภาพไม่ใช่ Lab ให้ summary = "ไม่พบผล Lab กรุณาถ่ายใหม่"`,
}

async function checkAndIncrementQuota(patientId, claimToken) {
  // Best-effort server-side quota enforcement. If Supabase isn't configured,
  // silently skip (dev/local). Returns an error string if blocked.
  if (!patientId || !claimToken) return null
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null

  // Verify claim_token so we don't charge a random patient_id.
  const rows = await sbRest(
    `/rest/v1/patients?id=eq.${encodeURIComponent(patientId)}&select=id,claim_token`,
  ).catch(() => null)
  if (!Array.isArray(rows) || rows.length === 0) return 'invalid_patient'
  if (rows[0].claim_token !== claimToken) return 'invalid_patient'

  const today = new Date().toISOString().slice(0, 10)
  const quota = await sbRest(
    `/rest/v1/photo_quota?patient_id=eq.${encodeURIComponent(patientId)}&quota_date=eq.${today}&select=count`,
  ).catch(() => [])
  const current = Array.isArray(quota) && quota[0] ? quota[0].count || 0 : 0
  if (current >= DAILY_PHOTO_LIMIT) return 'quota_exceeded'

  await sbRest(`/rest/v1/photo_quota?on_conflict=patient_id,quota_date`, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ patient_id: patientId, quota_date: today, count: current + 1 }),
  }).catch(() => null)

  return null
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, { status: 405 })
  if (!originAllowed(req))     return json({ error: 'forbidden_origin' }, { status: 403 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return json({ error: 'api_key_not_configured' }, { status: 500 })

  let body
  try {
    body = await readJson(req, MAX_IMAGE_BYTES + 1024)
  } catch (e) {
    return json({ error: e.message }, { status: e.status || 400 })
  }

  const { image, mode, patientId, claimToken } = body
  if (!image || !mode) return json({ error: 'missing_image_or_mode' }, { status: 400 })
  if (typeof image !== 'string' || image.length > MAX_IMAGE_BYTES) {
    return json({ error: 'image_too_large' }, { status: 413 })
  }

  const prompt = PROMPTS[mode]
  if (!prompt) return json({ error: 'invalid_mode' }, { status: 400 })

  const quotaErr = await checkAndIncrementQuota(patientId, claimToken)
  if (quotaErr) {
    const status = quotaErr === 'quota_exceeded' ? 429 : 403
    return json({ error: quotaErr }, { status })
  }

  // Extract base64 data
  const base64Data = image.includes(',') ? image.split(',')[1] : image
  const mediaType = image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
              { type: 'text', text: prompt },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return json({ error: 'claude_api_error', detail: err.slice(0, 500) }, { status: 502 })
    }

    const data = await response.json()
    const text = data?.content?.[0]?.text?.trim()
    if (!text) return json({ error: 'empty_response' }, { status: 502 })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return json({ error: 'could_not_parse', raw: text.slice(0, 500) }, { status: 502 })

    let result
    try { result = JSON.parse(jsonMatch[0]) }
    catch { return json({ error: 'invalid_json_from_model' }, { status: 502 }) }

    return json(result)
  } catch (err) {
    return json({ error: 'upstream_error', detail: (err?.message || '').slice(0, 200) }, { status: 502 })
  }
}
