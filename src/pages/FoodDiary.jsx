import { useState, useEffect } from 'react'
import { foods } from '../data/foods'
import { logFood, getTodayLogs } from '../lib/patient'

const MEALS = [
  { id: 'breakfast', label: 'เช้า',      icon: '🌅' },
  { id: 'lunch',     label: 'กลางวัน',   icon: '☀️' },
  { id: 'dinner',    label: 'เย็น',       icon: '🌙' },
  { id: 'snack',     label: 'ของว่าง',   icon: '🍎' },
]

function NutriBadge({ val, limit, unit, label }) {
  const pct = limit ? (val / limit) * 100 : 0
  const color = pct > 100 ? 'text-red-600 bg-red-100' : pct > 80 ? 'text-amber-600 bg-amber-100' : 'text-green-600 bg-green-100'
  return (
    <div className="text-center">
      <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
        {Math.round(val)}/{limit}
        <span className="font-normal"> {unit}</span>
      </div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  )
}

// ── Fuzzy search scorer ────────────────────────────────────────────────
function scoreFood(food, query) {
  const name = food.name
  if (!query) return 0
  // exact contains → highest
  if (name.includes(query)) return 100
  // all chars of query appear in name in order (subsequence)
  let i = 0
  for (const ch of name) {
    if (ch === query[i]) i++
    if (i === query.length) return 80
  }
  // count matching chars (any order)
  const matched = query.split('').filter(ch => name.includes(ch)).length
  return Math.round((matched / query.length) * 60)
}

function fuzzySearch(query) {
  if (!query || query.length < 1) return []
  const scored = foods
    .map(f => ({ f, score: scoreFood(f, query) }))
    .filter(x => x.score >= 50)               // เกณฑ์ขั้นต่ำ 50 คะแนน
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(x => x.f)
  return scored
}

export default function FoodDiary({ patientId, profile, onGoCamera }) {
  const [logs, setLogs]         = useState([])
  const [meal, setMeal]         = useState('breakfast')
  const [search, setSearch]     = useState('')
  const [portion, setPortion]   = useState(100)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)

  // custom food state
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customNa,   setCustomNa]   = useState('')
  const [customK,    setCustomK]    = useState('')
  const [customP,    setCustomP]    = useState('')
  const [customSaving, setCustomSaving] = useState(false)
  const [customSaved,  setCustomSaved]  = useState(false)
  const [estimating, setEstimating] = useState(false)
  const [estimateNote, setEstimateNote] = useState('')

  // limits based on stage
  const stage = profile?.stage || ''
  const isLateStage = ['4','5','5d'].includes(stage)
  const limits = {
    k:  isLateStage ? 1500 : 2000,
    p:  isLateStage ? 700  : 900,
    na: 2000,
  }

  useEffect(() => { loadLogs() }, [])

  const loadLogs = async () => {
    const data = await getTodayLogs(patientId)
    setLogs(data)
  }

  const totals = logs.reduce((acc, l) => ({
    k:  acc.k  + (l.potassium  || 0),
    p:  acc.p  + (l.phosphorus || 0),
    na: acc.na + (l.sodium     || 0),
  }), { k: 0, p: 0, na: 0 })

  const filtered = fuzzySearch(search)

  // บันทึกจากฐานข้อมูล
  const addFood = async () => {
    if (!selected) return
    setSaving(true)
    const ratio = portion / 100
    await logFood({
      patientId,
      mealType:   meal,
      foodName:   selected.name,
      portionGrams: portion,
      potassium:  Math.round(selected.k  * ratio),
      phosphorus: Math.round(selected.p  * ratio),
      sodium:     Math.round(selected.na * ratio),
      protein:    +(selected.protein * ratio).toFixed(1),
      calories:   Math.round(selected.kcal * ratio),
      safety:     'known',
      photoUsed:  false,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
    setSelected(null)
    setSearch('')
    setPortion(100)
    loadLogs()
  }

  // AI ประมาณค่า
  const estimateByAI = async () => {
    if (!customName.trim()) return
    setEstimating(true)
    setEstimateNote('')
    try {
      const res = await fetch('/api/estimate-nutrition', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ foodName: customName.trim() }),
      })
      const data = await res.json()
      if (data.na !== undefined) setCustomNa(String(data.na))
      if (data.k  !== undefined) setCustomK(String(data.k))
      if (data.p  !== undefined) setCustomP(String(data.p))
      if (data.note) setEstimateNote(data.note)
    } catch {
      setEstimateNote('ประมาณค่าไม่ได้ กรุณากรอกเอง')
    }
    setEstimating(false)
  }

  // บันทึกอาหารที่กรอกเอง
  const addCustomFood = async () => {
    if (!customName.trim()) return
    setCustomSaving(true)
    await logFood({
      patientId,
      mealType:     meal,
      foodName:     customName.trim(),
      portionGrams: 1,          // ไม่ได้คำนวณต่อ 100g → บันทึกเป็น per serving
      potassium:  parseInt(customK)  || 0,
      phosphorus: parseInt(customP)  || 0,
      sodium:     parseInt(customNa) || 0,
      protein:    0,
      calories:   0,
      safety:     'custom',
      photoUsed:  false,
    })
    setCustomSaving(false)
    setCustomSaved(true)
    setTimeout(() => setCustomSaved(false), 1500)
    setCustomName('')
    setCustomNa('')
    setCustomK('')
    setCustomP('')
    setShowCustom(false)
    setSearch('')
    loadLogs()
  }

  const mealLogs = (mealId) => logs.filter(l => l.meal_type === mealId)

  const alertFlags = []
  if (totals.k  > limits.k)  alertFlags.push(`⚠️ K เกิน (${Math.round(totals.k)}/${limits.k} mg)`)
  if (totals.p  > limits.p)  alertFlags.push(`⚠️ P เกิน (${Math.round(totals.p)}/${limits.p} mg)`)
  if (totals.na > limits.na) alertFlags.push(`⚠️ เค็มเกิน (${Math.round(totals.na)}/${limits.na} mg)`)

  const noResults = search.length >= 1 && filtered.length === 0 && !selected

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-gray-900">📅 บันทึกอาหารวันนี้</h1>
            <p className="text-xs text-gray-400">{new Date().toLocaleDateString('th-TH', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
          </div>
          <button onClick={onGoCamera} className="bg-sky-100 text-sky-700 text-xs font-bold px-3 py-2 rounded-xl">
            📸 AI ถ่ายรูป
          </button>
        </div>

        {/* Daily totals */}
        <div className="mt-3 flex justify-around">
          <NutriBadge val={totals.k}  limit={limits.k}  unit="mg" label="โพแทสเซียม" />
          <NutriBadge val={totals.p}  limit={limits.p}  unit="mg" label="ฟอสฟอรัส" />
          <NutriBadge val={totals.na} limit={limits.na} unit="mg" label="โซเดียม" />
        </div>

        {alertFlags.length > 0 && (
          <div className="mt-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {alertFlags.map((f, i) => <p key={i} className="text-xs text-red-700 font-semibold">{f}</p>)}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Meal selector */}
        <div className="grid grid-cols-4 gap-2">
          {MEALS.map(m => (
            <button key={m.id} onClick={() => setMeal(m.id)}
              className={`py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 border-2 transition-all ${
                meal === m.id ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 bg-white text-gray-500'
              }`}>
              <span className="text-lg">{m.icon}</span>{m.label}
              {mealLogs(m.id).length > 0 && <span className="text-sky-500">({mealLogs(m.id).length})</span>}
            </button>
          ))}
        </div>

        {/* Search food */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800 text-sm">➕ เพิ่มอาหาร — มื้อ{MEALS.find(m2 => m2.id === meal)?.label}</h3>
            <button
              onClick={() => { setShowCustom(!showCustom); setSearch(''); setSelected(null) }}
              className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
              ✏️ กรอกเอง
            </button>
          </div>

          {/* ── กรอกเอง form ── */}
          {showCustom && (
            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 space-y-3">
              <p className="text-xs text-purple-700 font-semibold">📋 เพิ่มอาหารที่ไม่มีในระบบ — กรอกค่าโภชนาการต่อ 1 มื้อ</p>
              <div>
                <label className="text-xs font-bold text-gray-600 block mb-1">ชื่ออาหาร *</label>
                <div className="flex gap-2">
                  <input className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                    placeholder="เช่น ข้าวต้มหมูสับ, แกงส้มปลา..."
                    value={customName} onChange={e => { setCustomName(e.target.value); setEstimateNote('') }} />
                  <button onClick={estimateByAI} disabled={estimating || !customName.trim()}
                    className="bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded-xl disabled:opacity-50 whitespace-nowrap">
                    {estimating ? '⏳...' : '🤖 AI ประมาณ'}
                  </button>
                </div>
                {estimateNote && (
                  <p className="text-xs text-indigo-600 mt-1">✨ {estimateNote} — ตรวจสอบและแก้ไขได้</p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-orange-600 block mb-1">🧂 โซเดียม (mg)</label>
                  <input type="number" min="0" max="5000"
                    className="w-full border border-orange-200 rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:border-orange-500"
                    placeholder="0" value={customNa} onChange={e => setCustomNa(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-purple-600 block mb-1">🫐 โพแทสเซียม (mg)</label>
                  <input type="number" min="0" max="5000"
                    className="w-full border border-purple-200 rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:border-purple-500"
                    placeholder="0" value={customK} onChange={e => setCustomK(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-bold text-yellow-600 block mb-1">🦴 ฟอสฟอรัส (mg)</label>
                  <input type="number" min="0" max="5000"
                    className="w-full border border-yellow-200 rounded-xl px-2 py-2 text-sm text-center focus:outline-none focus:border-yellow-500"
                    placeholder="0" value={customP} onChange={e => setCustomP(e.target.value)} />
                </div>
              </div>
              <p className="text-xs text-gray-400">💡 กด "🤖 AI ประมาณ" ให้ AI เติมค่าให้ แก้ไขได้เองก่อนบันทึก</p>
              <div className="flex gap-2">
                <button onClick={addCustomFood} disabled={customSaving || !customName.trim()}
                  className="flex-1 bg-purple-600 text-white font-bold py-2.5 rounded-xl disabled:opacity-50 text-sm">
                  {customSaving ? 'กำลังบันทึก...' : customSaved ? '✅ บันทึกแล้ว!' : '✅ บันทึกอาหารนี้'}
                </button>
                <button onClick={() => setShowCustom(false)}
                  className="px-4 bg-gray-100 text-gray-600 font-bold py-2.5 rounded-xl text-sm">
                  ยกเลิก
                </button>
              </div>
            </div>
          )}

          {/* ── Search input ── */}
          {!showCustom && (
            <>
              <input
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sky-500"
                placeholder="ค้นหาเมนู เช่น ข้าวต้ม, แกงจืด, ผัดผัก..."
                value={search}
                onChange={e => { setSearch(e.target.value); setSelected(null) }}
              />

              {filtered.length > 0 && (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {filtered.map(f => (
                    <button key={f.id} onClick={() => { setSelected(f); setSearch(f.name) }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm flex items-center justify-between border ${
                        selected?.id === f.id ? 'border-sky-500 bg-sky-50' : 'border-gray-100 hover:bg-gray-50'
                      }`}>
                      <span className="font-medium">{f.name}</span>
                      <span className="text-xs text-gray-400">K:{f.k} P:{f.p} Na:{f.na}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* ไม่พบเมนู → เสนอกรอกเอง */}
              {noResults && (
                <div className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">ไม่พบ "<strong>{search}</strong>" ในระบบ</p>
                  <button
                    onClick={() => { setShowCustom(true); setCustomName(search); setSearch('') }}
                    className="bg-purple-600 text-white text-sm font-bold px-4 py-2 rounded-xl">
                    ✏️ กรอกค่าโภชนาการเอง
                  </button>
                </div>
              )}

              {selected && (
                <div className="space-y-3">
                  <div className="bg-sky-50 rounded-xl p-3 text-xs space-y-1">
                    <div className="font-bold text-sky-800">{selected.name} — ต่อ 100g</div>
                    <div className="flex gap-3 text-sky-700">
                      <span>K: {selected.k}mg</span>
                      <span>P: {selected.p}mg</span>
                      <span>Na: {selected.na}mg</span>
                      <span>Pro: {selected.protein}g</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1">ปริมาณ (กรัม)</label>
                    <div className="flex gap-2 items-center">
                      <input type="number" min="10" max="500" step="10"
                        className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm"
                        value={portion} onChange={e => setPortion(Number(e.target.value))} />
                      <div className="text-xs text-gray-500 space-x-2">
                        {[50,100,150,200].map(p => (
                          <button key={p} onClick={() => setPortion(p)}
                            className={`px-2 py-1 rounded-lg ${portion===p?'bg-sky-600 text-white':'bg-gray-100'}`}>{p}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={addFood} disabled={saving}
                    className="w-full bg-sky-600 text-white font-bold py-3 rounded-xl disabled:opacity-50">
                    {saving ? 'กำลังบันทึก...' : saved ? '✅ บันทึกแล้ว!' : '✅ เพิ่มรายการนี้'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Today's logs per meal */}
        {MEALS.map(m => {
          const ml = mealLogs(m.id)
          if (ml.length === 0) return null
          return (
            <div key={m.id} className="bg-white rounded-2xl border border-gray-200 p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-2">{m.icon} มื้อ{m.label}</h3>
              <div className="space-y-2">
                {ml.map(l => (
                  <div key={l.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-xl px-3 py-2">
                    <div>
                      <span className="font-medium">{l.food_name}</span>
                      {l.photo_used && <span className="ml-1 text-xs text-sky-600">📸</span>}
                      {l.safety === 'custom' && <span className="ml-1 text-xs text-purple-500">✏️</span>}
                      <div className="text-xs text-gray-400">{l.safety === 'custom' ? 'กรอกเอง' : `${l.portion_grams}g`}</div>
                    </div>
                    <div className="text-right text-xs text-gray-500 space-y-0.5">
                      <div>K:{l.potassium} P:{l.phosphorus} Na:{l.sodium}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {logs.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🍽️</div>
            <p className="text-sm">ยังไม่มีรายการวันนี้<br />เริ่มบันทึกอาหารมื้อแรกได้เลย</p>
          </div>
        )}
      </div>
    </div>
  )
}
