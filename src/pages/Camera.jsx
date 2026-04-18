import { useState, useRef, useEffect } from 'react'
import { getLocalPatientId, getPhotoCount, incrementPhotoCount, DAILY_PHOTO_LIMIT, logFood } from '../lib/patient'

const MEALS = [
  { id: 'breakfast', label: 'เช้า',    icon: '🌅' },
  { id: 'lunch',     label: 'กลางวัน', icon: '☀️' },
  { id: 'dinner',    label: 'เย็น',     icon: '🌙' },
  { id: 'snack',     label: 'ของว่าง', icon: '🍎' },
]

const MODES = [
  {
    id: 'food',
    label: 'ผัก/ผลไม้/อาหาร',
    icon: '🥦',
    desc: 'ถ่ายรูปอาหาร AI จะบอกระดับ K, P, Na และความปลอดภัย',
    color: 'green',
    bg: 'bg-green-50',
    border: 'border-green-300',
    badge: 'bg-green-100 text-green-800',
    btn: 'bg-green-600 hover:bg-green-700',
  },
  {
    id: 'label',
    label: 'ฉลากอาหารเสริม',
    icon: '🏷️',
    desc: 'ถ่ายฉลากผลิตภัณฑ์ AI จะตรวจหา phosphate, KCl, collagen',
    color: 'orange',
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    badge: 'bg-orange-100 text-orange-800',
    btn: 'bg-orange-600 hover:bg-orange-700',
  },
  {
    id: 'lab',
    label: 'ใบผล Lab',
    icon: '🧪',
    desc: 'ถ่ายผลเลือด AI จะอ่านค่า K, P, Ca, Hb อัตโนมัติ',
    color: 'blue',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    badge: 'bg-blue-100 text-blue-800',
    btn: 'bg-blue-600 hover:bg-blue-700',
  },
]

export default function Camera() {
  const [mode, setMode] = useState(null)
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [showLiveCamera, setShowLiveCamera] = useState(false)
  const [photoCount, setPhotoCount] = useState(0)
  const patientId = getLocalPatientId()
  const fileRef = useRef()
  const cameraRef = useRef()
  const videoRef = useRef()
  const streamRef = useRef()

  const startCamera = async () => {
    setShowLiveCamera(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } }
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      setShowLiveCamera(false)
      cameraRef.current?.click()
    }
  }

  const snapPhoto = async () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    const resized = await resizeImage(canvas.toDataURL('image/jpeg', 0.9))
    setImage(resized)
    stopCamera()
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setShowLiveCamera(false)
  }

  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), [])
  useEffect(() => { if (patientId) getPhotoCount(patientId).then(setPhotoCount) }, [patientId])

  const resizeImage = (dataUrl, maxSize = 1024) =>
    new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = dataUrl
    })

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const resized = await resizeImage(ev.target.result)
      setImage(resized)
      setResult(null)
      setError(null)
    }
    reader.readAsDataURL(file)
  }

  const analyze = async () => {
    if (!image || !mode) return
    // quota check
    if (patientId && photoCount >= DAILY_PHOTO_LIMIT) {
      setError(`ใช้ครบ ${DAILY_PHOTO_LIMIT} รูปแล้ววันนี้ — กลับมาใหม่พรุ่งนี้ หรือเลือกอาหารจากรายการแทน`)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ image, mode: mode.id }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      // increment quota
      if (patientId) {
        await incrementPhotoCount(patientId)
        setPhotoCount(c => c + 1)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    stopCamera()
    setImage(null)
    setResult(null)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
    if (cameraRef.current) cameraRef.current.value = ''
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">📷 วิเคราะห์ด้วย AI</h1>
            <p className="text-sm text-gray-500 mt-0.5">ถ่ายรูปอาหาร ฉลาก หรือใบ Lab — AI วิเคราะห์ทันที</p>
          </div>
          {patientId && (
            <div className={`text-xs font-bold px-2 py-1 rounded-full ${photoCount >= DAILY_PHOTO_LIMIT ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              📸 {photoCount}/{DAILY_PHOTO_LIMIT} วันนี้
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Mode selection */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">เลือกสิ่งที่ต้องการวิเคราะห์</h2>
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => { setMode(m); reset() }}
              className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                mode?.id === m.id ? `${m.bg} ${m.border}` : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{m.icon}</span>
                <div>
                  <div className="font-bold text-gray-900">{m.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{m.desc}</div>
                </div>
                <div className={`ml-auto w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  mode?.id === m.id ? `${m.border} ${m.bg}` : 'border-gray-300'
                }`}>
                  {mode?.id === m.id && <div className="w-2.5 h-2.5 rounded-full bg-gray-700" />}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Image capture */}
        {mode && (
          <div className={`rounded-2xl border-2 p-4 ${mode.bg} ${mode.border}`}>
            <h2 className="font-bold text-gray-800 mb-3">{mode.icon} {mode.label}</h2>

            {showLiveCamera ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden bg-black">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl" style={{maxHeight:'65vw',objectFit:'cover'}} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={stopCamera}
                    className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-xl"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={snapPhoto}
                    className={`flex-grow text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 ${mode.btn}`}
                  >
                    <span className="text-2xl">📸</span> ถ่ายรูป
                  </button>
                </div>
              </div>
            ) : !image ? (
              <div className="space-y-2">
                {/* Live camera — no iOS gallery sheet */}
                <button
                  onClick={startCamera}
                  className={`w-full text-white font-bold py-4 rounded-xl text-base flex items-center justify-center gap-2 ${mode.btn}`}
                >
                  <span className="text-2xl">📷</span> เปิดกล้อง
                </button>

                {/* Fallback: gallery */}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
                <button
                  onClick={() => fileRef.current.click()}
                  className="w-full bg-white border-2 border-gray-300 text-gray-700 font-bold py-3 rounded-xl text-base flex items-center justify-center gap-2"
                >
                  <span className="text-xl">🖼️</span> เลือกจากคลัง
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <img src={image} alt="preview" className="w-full rounded-xl max-h-64 object-contain bg-white" />
                <div className="flex gap-2">
                  <button
                    onClick={reset}
                    className="flex-1 bg-white border-2 border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl"
                  >
                    ถ่ายใหม่
                  </button>
                  <button
                    onClick={analyze}
                    disabled={loading}
                    className={`flex-2 flex-grow text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 ${mode.btn} disabled:opacity-60`}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin text-xl">⏳</span> กำลังวิเคราะห์...
                      </>
                    ) : (
                      <>
                        <span>🤖</span> วิเคราะห์เลย
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4">
            <p className="text-red-800 font-semibold">❌ {error}</p>
            <button onClick={() => setError(null)} className="text-sm text-red-600 mt-1 underline">ลองใหม่</button>
          </div>
        )}

        {/* Results */}
        {result && mode && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <h2 className="font-extrabold text-gray-900 text-lg">ผลการวิเคราะห์</h2>
            </div>

            {mode.id === 'food' && <FoodResult data={result} patientId={patientId} />}
            {mode.id === 'label' && <LabelResult data={result} />}
            {mode.id === 'lab' && <LabResult data={result} />}

            <p className="text-xs text-center text-gray-400">
              ผลจาก AI ใช้ประกอบการตัดสินใจเท่านั้น — ปรึกษาแพทย์เสมอ
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// --- Food Result ---
function FoodResult({ data, patientId }) {
  const safetyColor = { safe: 'bg-green-100 text-green-800', caution: 'bg-yellow-100 text-yellow-800', danger: 'bg-red-100 text-red-800' }
  const kColor = { low: 'bg-green-100 text-green-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-red-100 text-red-800' }

  const [meal, setMeal]       = useState('lunch')
  const [portion, setPortion] = useState(100)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  const n = data.nutrients_per_100g || {}

  const saveToDiary = async () => {
    if (!patientId) return
    setSaving(true)
    const ratio = portion / 100
    await logFood({
      patientId,
      mealType:     meal,
      foodName:     data.name,
      portionGrams: portion,
      potassium:    Math.round((n.k  || 0) * ratio),
      phosphorus:   Math.round((n.p  || 0) * ratio),
      sodium:       Math.round((n.na || 0) * ratio),
      protein:      +((n.protein || 0) * ratio).toFixed(1),
      calories:     Math.round((n.kcal || 0) * ratio),
      safety:       'ai',
      photoUsed:    true,
      aiAnalysis:   JSON.stringify({ k_level: data.k_level, p_level: data.p_level, na_level: data.na_level }),
    })
    setSaving(false)
    setSaved(true)
  }

  if (data.name === 'ไม่ใช่อาหาร') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
        <p className="font-bold text-gray-700">ไม่พบอาหารในภาพ กรุณาถ่ายใหม่</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Name + category */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h3 className="text-xl font-extrabold text-gray-900">{data.name}</h3>
        <p className="text-sm text-gray-500">{data.category}</p>
        {data.tip_easy && (
          <div className="mt-2 bg-amber-50 rounded-xl px-3 py-2">
            <p className="text-sm font-semibold text-amber-800">💡 {data.tip_easy}</p>
          </div>
        )}
      </div>

      {/* Warning */}
      {data.warning && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-3">
          <p className="text-sm font-bold text-red-800">⚠️ {data.warning}</p>
        </div>
      )}

      {/* Nutrients */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h4 className="font-bold text-gray-700 mb-3 text-sm">ค่าโภชนาการ / 100g</h4>
        <div className="grid grid-cols-3 gap-2">
          <NutBox label="โพแทสเซียม" value={n.k}       unit="mg"   level={data.k_level}  levelColors={kColor} />
          <NutBox label="ฟอสฟอรัส"   value={n.p}       unit="mg"   level={data.p_level}  levelColors={kColor} />
          <NutBox label="โซเดียม"    value={n.na}      unit="mg"   level={data.na_level} levelColors={kColor} />
          <NutBox label="โปรตีน"     value={n.protein} unit="g"    neutral />
          <NutBox label="พลังงาน"    value={n.kcal}    unit="kcal" neutral />
        </div>
      </div>

      {/* ── บันทึกลงไดอารี่ ── */}
      {patientId && !saved && (
        <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-4 space-y-3">
          <h4 className="font-bold text-sky-800">📝 บันทึกลงไดอารี่วันนี้</h4>

          {/* เลือกมื้อ */}
          <div className="grid grid-cols-4 gap-1.5">
            {MEALS.map(m => (
              <button key={m.id} onClick={() => setMeal(m.id)}
                className={`py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 border-2 transition-all ${
                  meal === m.id ? 'border-sky-500 bg-white text-sky-700' : 'border-sky-100 bg-sky-100 text-sky-500'
                }`}>
                <span className="text-base">{m.icon}</span>{m.label}
              </button>
            ))}
          </div>

          {/* ปริมาณ */}
          <div>
            <label className="text-xs font-bold text-sky-700 block mb-1">ปริมาณที่กิน (กรัม)</label>
            <div className="flex gap-2 items-center">
              <input type="number" min="10" max="1000" step="10"
                className="flex-1 border border-sky-300 rounded-xl px-3 py-2 text-sm text-center bg-white"
                value={portion} onChange={e => setPortion(Number(e.target.value))} />
              <div className="flex gap-1">
                {[100, 150, 200, 250].map(p => (
                  <button key={p} onClick={() => setPortion(p)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-bold ${portion === p ? 'bg-sky-600 text-white' : 'bg-white border border-sky-200 text-sky-600'}`}>{p}</button>
                ))}
              </div>
            </div>
            {/* preview */}
            <div className="mt-2 flex gap-3 text-xs text-sky-600 font-semibold">
              <span>Na: {Math.round((n.na||0)*portion/100)} mg</span>
              <span>K: {Math.round((n.k||0)*portion/100)} mg</span>
              <span>P: {Math.round((n.p||0)*portion/100)} mg</span>
            </div>
          </div>

          <button onClick={saveToDiary} disabled={saving}
            className="w-full bg-sky-600 text-white font-bold py-3 rounded-xl disabled:opacity-50 text-base">
            {saving ? '⏳ กำลังบันทึก...' : '✅ บันทึกมื้อนี้เลย'}
          </button>
        </div>
      )}

      {saved && (
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-4 text-center">
          <div className="text-3xl mb-1">✅</div>
          <p className="font-extrabold text-green-800">บันทึกลงไดอารี่แล้ว!</p>
          <p className="text-sm text-green-600 mt-0.5">{data.name} · {portion}g · มื้อ{MEALS.find(m=>m.id===meal)?.label}</p>
        </div>
      )}

      {!patientId && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 text-center">
          <p className="text-sm text-gray-500">ลงทะเบียนก่อนเพื่อบันทึกลงไดอารี่</p>
        </div>
      )}

      {/* Safety by stage */}
      {data.safety && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h4 className="font-bold text-gray-700 mb-3 text-sm">ความปลอดภัยตามระยะ</h4>
          <div className="space-y-2">
            <SafetyRow label="Stage 2-3 (ระยะต้น)" level={data.safety.stage_early} colors={safetyColor} />
            <SafetyRow label="Stage 4-5 (ระยะหนัก)" level={data.safety.stage_late} colors={safetyColor} />
            <SafetyRow label="ฟอกเลือด (HD)" level={data.safety.stage_hd} colors={safetyColor} />
          </div>
        </div>
      )}

      {/* Tips */}
      {data.tips?.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
          <h4 className="font-bold text-green-800 mb-2">คำแนะนำ</h4>
          {data.tips.map((t, i) => <p key={i} className="text-sm text-green-900 mb-1">• {t}</p>)}
        </div>
      )}
    </div>
  )
}

// --- Label Result ---
function LabelResult({ data }) {
  const safetyBg = { safe: 'bg-green-50 border-green-300', caution: 'bg-yellow-50 border-yellow-300', danger: 'bg-red-50 border-red-300' }
  const safetyText = { safe: 'text-green-800', caution: 'text-yellow-800', danger: 'text-red-800' }
  const safetyIcon = { safe: '✅', caution: '⚠️', danger: '🚫' }
  const sevColor = { high: 'bg-red-100 text-red-800', medium: 'bg-yellow-100 text-yellow-800', low: 'bg-gray-100 text-gray-700' }

  const safety = data.overall_safety || 'caution'

  return (
    <div className="space-y-3">
      {/* Verdict */}
      <div className={`rounded-2xl border-2 p-4 ${safetyBg[safety] || 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{safetyIcon[safety]}</span>
          <h3 className={`text-lg font-extrabold ${safetyText[safety]}`}>{data.product_name}</h3>
        </div>
        <p className={`text-sm font-semibold ${safetyText[safety]}`}>{data.verdict}</p>
      </div>

      {/* Dangerous ingredients */}
      {data.dangerous_ingredients?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h4 className="font-bold text-red-700 mb-2">⚠️ ส่วนผสมที่ต้องระวัง</h4>
          {data.dangerous_ingredients.map((ing, i) => (
            <div key={i} className="mb-2 p-3 bg-red-50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${sevColor[ing.severity]}`}>
                  {ing.severity === 'high' ? 'อันตรายมาก' : ing.severity === 'medium' ? 'ระวัง' : 'สังเกต'}
                </span>
                <span className="font-bold text-gray-900 text-sm">{ing.name}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">{ing.reason}</p>
            </div>
          ))}
        </div>
      )}

      {/* Flags */}
      {data.flags?.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <h4 className="font-bold text-orange-800 mb-2">🚩 พบสิ่งที่ต้องระวัง</h4>
          <div className="flex flex-wrap gap-2">
            {data.flags.map((f, i) => (
              <span key={i} className="text-sm font-semibold bg-orange-200 text-orange-900 px-2.5 py-1 rounded-full">{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      {data.recommendation && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-sm font-semibold text-blue-900">💊 {data.recommendation}</p>
        </div>
      )}
    </div>
  )
}

// --- Lab Result ---
function LabResult({ data }) {
  const statusColor = {
    normal: 'bg-green-100 text-green-800',
    low: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  }
  const statusLabel = { normal: 'ปกติ', low: 'ต่ำ', high: 'สูง', critical: 'วิกฤต!' }
  const labFields = [
    { key: 'k', label: 'โพแทสเซียม K', icon: '🫐' },
    { key: 'p', label: 'ฟอสฟอรัส P', icon: '🦴' },
    { key: 'ca', label: 'แคลเซียม Ca', icon: '🥛' },
    { key: 'hb', label: 'ฮีโมโกลบิน Hb', icon: '🩸' },
    { key: 'cr', label: 'ครีเอตินีน Cr', icon: '🧬' },
    { key: 'bun', label: 'BUN', icon: '🔬' },
    { key: 'na', label: 'โซเดียม Na', icon: '🧂' },
  ]

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className={`rounded-2xl border-2 p-4 ${data.urgent ? 'bg-red-50 border-red-400' : 'bg-blue-50 border-blue-300'}`}>
        {data.urgent && <p className="text-red-800 font-extrabold mb-2">🚨 ต้องพบแพทย์ด่วน!</p>}
        <p className={`text-sm font-semibold ${data.urgent ? 'text-red-800' : 'text-blue-800'}`}>{data.summary}</p>
        {data.lab_date && <p className="text-xs text-gray-500 mt-1">วันที่ผล: {data.lab_date}</p>}
      </div>

      {/* Lab values */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <h4 className="font-bold text-gray-700 mb-3">ผลเลือด</h4>
        <div className="space-y-2">
          {labFields.map(({ key, label, icon }) => {
            const val = data.values?.[key]
            if (!val || val.value === null || val.value === 0) return null
            return (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span>{icon}</span>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">{label}</div>
                    <div className="text-xs text-gray-400">{val.normal_range} {val.unit}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-gray-900">{val.value}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor[val.status] || 'bg-gray-100 text-gray-600'}`}>
                    {statusLabel[val.status] || val.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Alerts */}
      {data.alerts?.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
          <h4 className="font-bold text-orange-800 mb-2">⚠️ ค่าที่ต้องระวัง</h4>
          {data.alerts.map((a, i) => <p key={i} className="text-sm text-orange-900 mb-1">• {a}</p>)}
        </div>
      )}

      {/* Diet implications */}
      {data.diet_implications && (
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h4 className="font-bold text-gray-700 mb-2">แนวทางอาหาร</h4>
          {Object.entries(data.diet_implications).map(([key, val]) => {
            const labels = { k_restriction: 'จำกัด K', p_restriction: 'จำกัด P', fluid_restriction: 'จำกัดน้ำ' }
            const valLabel = { none: 'ไม่จำเป็น', moderate: 'จำกัดปานกลาง', strict: 'จำกัดเข้มงวด' }
            const valColor = { none: 'text-green-700', moderate: 'text-yellow-700', strict: 'text-red-700' }
            return (
              <div key={key} className="flex justify-between py-1">
                <span className="text-sm text-gray-600">{labels[key]}</span>
                <span className={`text-sm font-bold ${valColor[val]}`}>{valLabel[val]}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// --- Shared components ---
function NutBox({ label, value, unit, level, levelColors, neutral }) {
  const color = neutral ? 'bg-gray-50 text-gray-700' : (levelColors?.[level] || 'bg-gray-50 text-gray-700')
  return (
    <div className={`rounded-xl p-2.5 ${color}`}>
      <div className="text-xs font-semibold opacity-70">{label}</div>
      <div className="text-lg font-extrabold">{value ?? '—'}</div>
      <div className="text-xs">{unit}</div>
    </div>
  )
}

function SafetyRow({ label, level, colors }) {
  const icons = { safe: '✅', caution: '⚠️', danger: '🚫' }
  const labels = { safe: 'กินได้', caution: 'ระวัง', danger: 'หลีกเลี่ยง' }
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${colors[level] || 'bg-gray-100 text-gray-600'}`}>
        {icons[level]} {labels[level] || level}
      </span>
    </div>
  )
}
