import { useState, useEffect } from 'react'
import { stages } from '../data/stageInfo'
import { tips } from '../data/tips'
import { BANNED_FOODS } from '../data/foods'

export default function Home({ profile, onGoProfile, onGoFood, onGoCamera, onGoTips }) {
  const [dailyTip, setDailyTip] = useState(null)
  const stage = stages.find((s) => s.id === profile.stage)
  const fromScreening = new URLSearchParams(window.location.search).get('stage')

  useEffect(() => {
    // Pick a tip based on the day
    const dayOfYear = Math.floor(Date.now() / 86400000)
    setDailyTip(tips[dayOfYear % tips.length])
  }, [])

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-extrabold text-sky-700">ไตดี 🫘</h1>
          <p className="text-sm text-gray-500">คู่มืออาหารสำหรับผู้ป่วยไต</p>
        </div>
        <button
          onClick={onGoProfile}
          className="bg-sky-50 text-sky-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-sky-200"
        >
          โปรไฟล์
        </button>
      </div>

      {/* From screening banner */}
      {fromScreening && (
        <div className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-3 flex items-center gap-3">
          <span className="text-2xl">🏥</span>
          <div>
            <div className="font-bold text-sky-800 text-sm">มาจาก CKD Screening</div>
            <div className="text-xs text-sky-600">ตั้งค่าโปรไฟล์จากผลการคัดกรองอัตโนมัติแล้ว</div>
          </div>
        </div>
      )}

      {/* Stage card */}
      {profile.stage ? (
        <div className={`rounded-2xl border-2 p-4 ${stage?.bgColor} ${stage?.borderColor}`}>
          <div className="flex items-start justify-between">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wide ${stage?.textColor}`}>โปรไฟล์คุณ</span>
              <h2 className={`text-lg font-extrabold mt-0.5 ${stage?.textColor}`}>{stage?.label}</h2>
              <p className={`text-sm font-medium ${stage?.textColor} opacity-80`}>{stage?.desc}</p>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${stage?.badgeColor}`}>
              Stage {profile.stage}
            </span>
          </div>

          <div className="mt-3 space-y-1">
            <div className={`text-sm font-semibold ${stage?.textColor}`}>โปรตีนที่แนะนำ: {stage?.protein}</div>
            {profile.weight && (
              <div className={`text-sm ${stage?.textColor} opacity-80`}>
                น้ำหนัก {profile.weight} kg →{' '}
                {stage && calcProtein(stage, profile.weight)}
              </div>
            )}
          </div>

          {/* Comorbidities */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {profile.hasDiabetes && <Chip label="เบาหวาน" />}
            {profile.hasHypertension && <Chip label="ความดันสูง" />}
            {profile.hasHeart && <Chip label="โรคหัวใจ" />}
            {profile.hasGout && <Chip label="เกาต์" />}
            {profile.onKMed && <Chip label="ยาลด K" color="red" />}
            {profile.onPBinder && <Chip label="ยาจับ P" color="red" />}
            {profile.fluidRestrict && <Chip label="จำกัดน้ำ" color="blue" />}
          </div>
        </div>
      ) : (
        <button
          onClick={onGoProfile}
          className="w-full bg-sky-600 text-white rounded-2xl p-5 text-left shadow-lg shadow-sky-200"
        >
          <div className="text-lg font-extrabold">ตั้งค่าโปรไฟล์ของคุณ</div>
          <div className="text-sm mt-1 opacity-90">เพื่อรับคำแนะนำอาหารที่เหมาะกับระยะโรคไตของคุณ</div>
          <div className="mt-3 text-sm font-semibold bg-white/20 rounded-xl px-3 py-1.5 inline-block">
            กดเพื่อเริ่มต้น →
          </div>
        </button>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onGoFood}
          className="bg-white border border-gray-200 rounded-2xl p-4 text-left shadow-sm hover:bg-sky-50 transition-colors"
        >
          <div className="text-2xl mb-1">🔍</div>
          <div className="font-bold text-gray-800">ค้นหาอาหาร</div>
          <div className="text-xs text-gray-500 mt-0.5">กินได้ไหม? เช็คได้เลย</div>
        </button>
        <button
          onClick={onGoCamera}
          className="bg-white border border-gray-200 rounded-2xl p-4 text-left shadow-sm hover:bg-purple-50 transition-colors"
        >
          <div className="text-2xl mb-1">📸</div>
          <div className="font-bold text-gray-800">ถ่ายรูป AI</div>
          <div className="text-xs text-gray-500 mt-0.5">วิเคราะห์อาหารด้วย AI</div>
        </button>
      </div>

      {/* Daily tip */}
      {dailyTip && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">💡</span>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">คำจำง่ายประจำวัน</span>
            </div>
            <button onClick={onGoTips} className="text-xs font-bold text-amber-600 underline">ดูทั้งหมด →</button>
          </div>
          <p className="text-base font-semibold text-amber-900 leading-snug">"{dailyTip.text}"</p>
        </div>
      )}

      {/* Alert: Low-sodium trap */}
      <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">⚠️</span>
          <span className="text-sm font-bold text-red-700">กับดักที่ต้องระวัง!</span>
        </div>
        <div className="space-y-1.5">
          <AlertRow icon="🧂" text="ซีอิ๊วโลโซเดียม 1 ช้อนโต๊ะ = K 700 mg" />
          <AlertRow icon="🐟" text="น้ำปลาโลโซเดียม 1 ช้อนโต๊ะ = K 900 mg" />
          <AlertRow icon="🚫" text="เกลือทดแทน = โพแทสเซียมคลอไรด์ อันตราย!" />
        </div>
      </div>

      {/* Banned foods quick list */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span>🚫</span> อาหารต้องห้ามเด็ดขาด
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {BANNED_FOODS.slice(0, 4).map((f) => (
            <div key={f.name} className="bg-red-50 rounded-xl p-2.5 border border-red-100">
              <div className="text-base">{f.icon}</div>
              <div className="text-sm font-bold text-red-800 mt-0.5">{f.name}</div>
              <div className="text-xs text-red-600 mt-0.5">{f.danger}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stage guide */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <h3 className="font-bold text-gray-800 mb-3">ระยะโรคไต</h3>
        <div className="space-y-2">
          {stages.map((s) => (
            <div
              key={s.id}
              className={`flex items-center justify-between rounded-xl px-3 py-2 ${s.bgColor}`}
            >
              <div>
                <span className={`text-xs font-bold ${s.textColor}`}>{s.label}</span>
                <span className={`text-xs ml-2 ${s.textColor} opacity-70`}>{s.desc}</span>
              </div>
              <span className={`text-xs font-semibold ${s.textColor}`}>{s.protein}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 pb-2">
        ข้อมูลอ้างอิง: KDIGO 2024 · KDOQI 2020 · สมาคมโรคไตแห่งประเทศไทย<br />
        <span className="font-medium text-gray-500">พัฒนาโดยแพทย์โรคไต — ใช้ประกอบการปรึกษาแพทย์เท่านั้น</span>
      </div>
    </div>
  )
}

function calcProtein(stage, weight) {
  const w = parseFloat(weight)
  if (!w) return ''
  const ranges = {
    A: [0.8, 0.8],
    B: [0.6, 0.8],
    C: [0.6, 0.8],
    D: [0.3, 0.6],
    E: [1.0, 1.2],
    F: [1.0, 1.3],
  }
  const r = ranges[stage.id]
  if (!r) return ''
  const lo = (w * r[0]).toFixed(0)
  const hi = (w * r[1]).toFixed(0)
  if (lo === hi) return `โปรตีน ${lo} g/วัน`
  return `โปรตีน ${lo}–${hi} g/วัน`
}

function Chip({ label, color = 'gray' }) {
  const colors = {
    gray: 'bg-gray-200 text-gray-700',
    red: 'bg-red-200 text-red-800',
    blue: 'bg-blue-200 text-blue-800',
  }
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[color]}`}>{label}</span>
}

function AlertRow({ icon, text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-red-800">
      <span>{icon}</span>
      <span className="font-medium">{text}</span>
    </div>
  )
}
