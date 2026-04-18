export const config = { runtime: 'edge' }

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

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { image, mode } = body
  if (!image || !mode) {
    return new Response(JSON.stringify({ error: 'Missing image or mode' }), { status: 400 })
  }

  const prompt = PROMPTS[mode]
  if (!prompt) {
    return new Response(JSON.stringify({ error: 'Invalid mode' }), { status: 400 })
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
        model: 'claude-sonnet-4-20250514',
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
      return new Response(JSON.stringify({ error: `Claude API error: ${err}` }), { status: 500 })
    }

    const data = await response.json()
    const text = data.content[0].text.trim()

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: 'Could not parse response', raw: text }), { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])
    return new Response(JSON.stringify(result), {
      headers: { 'content-type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
