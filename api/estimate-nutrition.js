import { json, originAllowed, readJson } from './_utils.js'

export const config = { runtime: 'edge' }

const MAX_NAME_LEN = 200

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204 })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, { status: 405 })
  if (!originAllowed(req))     return json({ error: 'forbidden_origin' }, { status: 403 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return json({ error: 'api_key_not_configured' }, { status: 500 })

  let body
  try {
    body = await readJson(req, 16 * 1024)
  } catch (e) {
    return json({ error: e.message }, { status: e.status || 400 })
  }

  const foodName = typeof body?.foodName === 'string' ? body.foodName.trim() : ''
  if (!foodName) return json({ error: 'no_food_name' }, { status: 400 })
  if (foodName.length > MAX_NAME_LEN) {
    return json({ error: 'name_too_long' }, { status: 400 })
  }

  const prompt = `คุณเป็นนักโภชนาการผู้เชี่ยวชาญโรคไต (CKD) ที่รู้จักอาหารไทยดีมาก

ประมาณค่าโภชนาการของอาหารนี้: "${foodName.replace(/"/g, '\\"')}"

ตอบเป็น JSON เท่านั้น ไม่มีข้อความอื่น:
{
  "na": 0,
  "k": 0,
  "p": 0,
  "note": "หมายเหตุสั้นๆ เช่น ค่าโดยประมาณ อาจแตกต่างตามสูตร"
}

กฎ:
- ค่าเป็น mg ต่อ 1 มื้อทั่วไป (ไม่ใช่ต่อ 100g)
- ถ้าเป็นของเหลว (ซุป น้ำแกง) ประมาณ 1 ถ้วย (~200ml)
- ถ้าเป็นอาหารจาน ประมาณ 1 จานทั่วไป
- ให้ตัวเลขที่สมเหตุสมผลสำหรับอาหารไทย
- ถ้าไม่แน่ใจ ให้ประมาณกลางๆ ไม่ต้องกรอก 0`

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!resp.ok) {
      const err = await resp.text()
      return json({ error: 'claude_api_error', detail: err.slice(0, 500) }, { status: 502 })
    }

    const data = await resp.json()
    const text = data?.content?.[0]?.text
    if (!text) return json({ error: 'empty_response' }, { status: 502 })

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return json({ error: 'parse_error', raw: text.slice(0, 500) }, { status: 502 })

    try { return json(JSON.parse(jsonMatch[0])) }
    catch { return json({ error: 'invalid_json_from_model' }, { status: 502 }) }
  } catch (err) {
    return json({ error: 'upstream_error', detail: (err?.message || '').slice(0, 200) }, { status: 502 })
  }
}
