export const config = { runtime: 'edge' }

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  const { foodName } = await req.json()
  if (!foodName) return new Response(JSON.stringify({ error: 'no food name' }), { status: 400 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return new Response(JSON.stringify({ error: 'no api key' }), { status: 500 })

  const prompt = `คุณเป็นนักโภชนาการผู้เชี่ยวชาญโรคไต (CKD) ที่รู้จักอาหารไทยดีมาก

ประมาณค่าโภชนาการของอาหารนี้: "${foodName}"

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

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  const data = await resp.json()
  const text = data.content?.[0]?.text || '{}'

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const result = JSON.parse(jsonMatch?.[0] || '{}')
    return new Response(JSON.stringify(result), {
      headers: { 'content-type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'parse error', raw: text }), { status: 500 })
  }
}
