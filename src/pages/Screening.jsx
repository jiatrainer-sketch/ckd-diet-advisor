export default function Screening({ risk, alb, profile, onGoFood, onGoCamera }) {
  const riskConfig = {
    high:   { bg: 'bg-red-50',    border: 'border-red-300',   text: 'text-red-700',   badge: 'bg-red-100 text-red-800',   icon: '🔴', label: 'ความเสี่ยงสูง' },
    medium: { bg: 'bg-amber-50',  border: 'border-amber-300', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800', icon: '🟡', label: 'ความเสี่ยงปานกลาง' },
    low:    { bg: 'bg-green-50',  border: 'border-green-300', text: 'text-green-700', badge: 'bg-green-100 text-green-800', icon: '🟢', label: 'ความเสี่ยงต่ำ' },
  }
  const cfg = riskConfig[risk] || riskConfig['medium']
  const albNum = parseInt(alb) || 0
  const hasDM = profile.hasDiabetes
  const hasHT = profile.hasHypertension

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pt-2">
        <div>
          <h1 className="text-xl font-extrabold text-sky-700">ผลคัดกรองโรคไต</h1>
          <p className="text-sm text-gray-500">W Medical Hospital</p>
        </div>
      </div>

      {/* Risk card */}
      <div className={`rounded-2xl border-2 p-4 ${cfg.bg} ${cfg.border}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-bold ${cfg.text}`}>ผลการคัดกรอง</span>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${cfg.badge}`}>
            {cfg.icon} {cfg.label}
          </span>
        </div>
        {albNum > 0 && (
          <div className={`text-sm ${cfg.text} font-semibold`}>
            Protein ในปัสสาวะ: {'+'  .repeat(albNum)} ({albNum === 3 ? 'สูงมาก' : albNum === 2 ? 'สูง' : 'เล็กน้อย'})
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {hasDM && <span className="text-xs bg-orange-100 text-orange-800 font-semibold px-2 py-0.5 rounded-full">เบาหวาน</span>}
          {hasHT && <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">ความดันสูง</span>}
        </div>
      </div>

      {/* What we don't know yet */}
      <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4">
        <div className="font-bold text-sky-800 mb-2 flex items-center gap-2">
          <span>🩸</span> ยังต้องตรวจเพิ่ม
        </div>
        <p className="text-sm text-sky-700 mb-3">
          การคัดกรองนี้ยังไม่ทราบ <b>ระยะโรคไต</b> — ต้องตรวจเลือดเพื่อรู้ eGFR
          แล้วจึงให้คำแนะนำอาหารที่แม่นยำได้
        </p>
        <div className="space-y-1 text-sm text-sky-800">
          <div className="flex items-center gap-2">☐ <span>Serum Creatinine (eGFR)</span></div>
          <div className="flex items-center gap-2">☐ <span>Urine ACR</span></div>
          {hasDM && <div className="flex items-center gap-2">☐ <span>HbA1c</span></div>}
        </div>
        <a
          href="tel:0800000000"
          className="mt-3 flex items-center justify-center gap-2 bg-sky-600 text-white rounded-xl py-2.5 font-bold text-sm"
        >
          📍 นัดตรวจเลือดที่ W Medical Hospital
        </a>
      </div>

      {/* What you can do NOW */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <h3 className="font-bold text-gray-800 mb-3">สิ่งที่ทำได้ตอนนี้เลย</h3>
        <div className="space-y-2">
          <TipRow icon="🧂" text="ลดเค็ม — โซเดียมไม่เกิน 2,000 mg/วัน (น้ำปลา ซีอิ๊ว กะปิ)" />
          <TipRow icon="🚫" text="หลีกเลี่ยงเกลือทดแทน — มีโพแทสเซียมคลอไรด์ อันตรายมาก" />
          <TipRow icon="💧" text="ดื่มน้ำเปล่า 6-8 แก้ว/วัน (ถ้าไม่ได้รับการจำกัดน้ำ)" />
          {hasDM && <TipRow icon="🍚" text="คุมแป้ง-น้ำตาล — ข้าวขาว ขนมหวาน น้ำผลไม้" />}
          {hasHT && <TipRow icon="🥩" text="ลดเนื้อสัตว์แปรรูป — ไส้กรอก แฮม หมูยอ" />}
          {albNum >= 2 && <TipRow icon="🥦" text="หลีกเลี่ยงโปรตีนสูงมาก — เนื้อแดง อาหารเสริมโปรตีน" />}
        </div>
      </div>

      {/* Quick tools */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onGoFood}
          className="bg-white border border-gray-200 rounded-2xl p-4 text-left shadow-sm"
        >
          <div className="text-2xl mb-1">🔍</div>
          <div className="font-bold text-gray-800 text-sm">เช็คอาหาร</div>
          <div className="text-xs text-gray-500 mt-0.5">กินได้ไหม?</div>
        </button>
        <button
          onClick={onGoCamera}
          className="bg-white border border-gray-200 rounded-2xl p-4 text-left shadow-sm"
        >
          <div className="text-2xl mb-1">📸</div>
          <div className="font-bold text-gray-800 text-sm">ถ่ายรูปอาหาร</div>
          <div className="text-xs text-gray-500 mt-0.5">AI วิเคราะห์ K/P/Na</div>
        </button>
      </div>

      {/* Danger foods */}
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span>⚠️</span>
          <span className="font-bold text-red-700 text-sm">อาหารต้องห้ามเด็ดขาด</span>
        </div>
        <div className="space-y-1.5 text-sm text-red-800">
          <div className="flex items-center gap-2"><span>🧂</span><span>เกลือทดแทน / โลโซเดียม = โพแทสเซียมคลอไรด์</span></div>
          <div className="flex items-center gap-2"><span>🌿</span><span>สมุนไพรบางชนิด: กระวาน, โสม, ชะเอม</span></div>
          <div className="flex items-center gap-2"><span>💊</span><span>ยาแก้ปวดบ่อย: ibuprofen, naproxen</span></div>
        </div>
      </div>

      <div className="text-center text-xs text-gray-400 pb-2">
        ข้อมูลอ้างอิง: KDIGO 2024 · KDOQI 2020<br />
        <span className="font-medium text-gray-500">ใช้ประกอบการปรึกษาแพทย์เท่านั้น</span>
      </div>
    </div>
  )
}

function TipRow({ icon, text }) {
  return (
    <div className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2">
      <span className="mt-0.5">{icon}</span>
      <span>{text}</span>
    </div>
  )
}
