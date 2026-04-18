import { stages } from '../data/stageInfo'

export default function Profile({ profile, updateProfile }) {
  const stage = stages.find((s) => s.id === profile.stage)

  const toggle = (key) => updateProfile({ [key]: !profile[key] })

  return (
    <div className="p-4 space-y-5 pb-8">
      <div className="pt-2">
        <h1 className="text-xl font-extrabold text-gray-900">👤 โปรไฟล์ของฉัน</h1>
        <p className="text-sm text-gray-500 mt-0.5">ตั้งค่าเพื่อรับคำแนะนำที่เหมาะกับคุณ</p>
      </div>

      {/* Stage selection */}
      <Section title="ระยะโรคไตของคุณ" required>
        <div className="space-y-2">
          {stages.map((s) => (
            <button
              key={s.id}
              onClick={() => updateProfile({ stage: s.id })}
              className={`w-full text-left rounded-xl border-2 p-3.5 transition-all ${
                profile.stage === s.id
                  ? `${s.bgColor} ${s.borderColor}`
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-bold ${profile.stage === s.id ? s.textColor : 'text-gray-800'}`}>
                    {s.label}
                  </div>
                  <div className={`text-xs mt-0.5 ${profile.stage === s.id ? s.textColor : 'text-gray-500'} opacity-80`}>
                    {s.desc} · โปรตีน {s.protein}
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  profile.stage === s.id ? `${s.borderColor} ${s.bgColor}` : 'border-gray-300'
                }`}>
                  {profile.stage === s.id && (
                    <div className={`w-2.5 h-2.5 rounded-full ${s.textColor.replace('text-', 'bg-')}`} />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* Weight */}
      <Section title="น้ำหนักตัว (กก.)">
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={profile.weight}
            onChange={(e) => updateProfile({ weight: e.target.value })}
            placeholder="เช่น 60"
            className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold focus:outline-none focus:border-sky-400"
            min="30"
            max="150"
          />
          <span className="text-gray-500 font-medium">กก.</span>
        </div>
        {profile.weight && stage && (
          <div className={`mt-2 text-sm font-semibold rounded-xl px-3 py-2 ${stage.bgColor} ${stage.textColor}`}>
            โปรตีนที่แนะนำ: {calcProtein(stage, profile.weight)}
          </div>
        )}
      </Section>

      {/* Comorbidities */}
      <Section title="โรคร่วม">
        <div className="space-y-2">
          <ToggleRow label="เบาหวาน" checked={profile.hasDiabetes} onChange={() => toggle('hasDiabetes')} />
          <ToggleRow label="ความดันโลหิตสูง" checked={profile.hasHypertension} onChange={() => toggle('hasHypertension')} />
          <ToggleRow label="โรคหัวใจ" checked={profile.hasHeart} onChange={() => toggle('hasHeart')} />
          <ToggleRow label="โรคเกาต์" checked={profile.hasGout} onChange={() => toggle('hasGout')} />
        </div>
      </Section>

      {/* Lab results */}
      <Section title="ผลเลือดล่าสุด (ถ้าทราบ)">
        <div className="space-y-2">
          <p className="text-sm text-gray-600 mb-3">หมอเคยบอกว่าโพแทสเซียม (K) ในเลือดสูงไหม?</p>
          <div className="flex gap-2">
            {[
              { val: 'normal', label: 'ปกติ', bg: 'bg-green-100 border-green-400 text-green-800' },
              { val: 'high', label: 'สูง', bg: 'bg-red-100 border-red-400 text-red-800' },
              { val: 'unknown', label: 'ไม่แน่ใจ', bg: 'bg-gray-100 border-gray-400 text-gray-700' },
            ].map((opt) => (
              <button
                key={opt.val}
                onClick={() => updateProfile({ kStatus: opt.val })}
                className={`flex-1 py-2.5 rounded-xl border-2 font-semibold text-sm transition-colors ${
                  profile.kStatus === opt.val ? opt.bg : 'bg-white border-gray-200 text-gray-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Medications */}
      <Section title="ยาที่กินอยู่">
        <div className="space-y-2">
          <ToggleRow
            label="ยาลดโพแทสเซียม (Kayexalate, Lokelma, Patiromer)"
            sublabel="แปลว่า K เคยสูงหรือสูงอยู่"
            checked={profile.onKMed}
            onChange={() => toggle('onKMed')}
            color="red"
          />
          <ToggleRow
            label="ยาจับฟอสฟอรัส (Calcium carbonate, Sevelamer, Lanthanum)"
            sublabel="แปลว่า P เคยสูงหรือสูงอยู่"
            checked={profile.onPBinder}
            onChange={() => toggle('onPBinder')}
            color="orange"
          />
          <ToggleRow
            label="Metformin (ยาเบาหวาน)"
            sublabel="ถ้ากินนาน >4 ปี ควรเช็ค B12"
            checked={profile.onMetformin}
            onChange={() => toggle('onMetformin')}
          />
        </div>
      </Section>

      {/* Fluid restriction */}
      <Section title="การจำกัดน้ำ">
        <div className="space-y-2">
          <ToggleRow
            label="จำกัดน้ำ (หมอสั่ง หรือเคยบวม)"
            sublabel="สำหรับ HD ปัสสาวะ + 500ml/วัน"
            checked={profile.fluidRestrict}
            onChange={() => toggle('fluidRestrict')}
            color="blue"
          />
        </div>
      </Section>

      {/* Info box */}
      {profile.onKMed && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4">
          <p className="text-sm font-bold text-red-800 flex items-start gap-2">
            <span className="text-xl">⚠️</span>
            <span>กินยาลด K = K ยังสูงอยู่ แอปจะแนะนำให้เข้มงวด K มากขึ้น ยาช่วยได้ แต่ต้องคุมปากด้วย</span>
          </p>
        </div>
      )}
      {profile.onPBinder && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-4">
          <p className="text-sm font-bold text-orange-800 flex items-start gap-2">
            <span className="text-xl">💊</span>
            <span>ยาจับ P ต้องกินคำแรกพร้อมอาหาร ไม่ใช่หลังอาหาร — ยาจับ P ไม่ใช่ใบอนุญาตกินลูกชิ้น</span>
          </p>
        </div>
      )}
      {profile.onMetformin && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-sm text-blue-800 font-medium flex items-start gap-2">
            <span className="text-xl">💉</span>
            <span>กิน Metformin นาน &gt;4 ปี? ควรตรวจระดับ B12 ในเลือด เพราะ Metformin ลดการดูดซึม B12</span>
          </p>
        </div>
      )}

      {/* Summary */}
      {profile.stage && (
        <div className={`rounded-2xl border-2 p-4 ${stage?.bgColor} ${stage?.borderColor}`}>
          <h3 className={`font-extrabold mb-2 ${stage?.textColor}`}>สรุปโปรไฟล์ของคุณ</h3>
          <div className={`space-y-1 text-sm ${stage?.textColor}`}>
            <p>• ระยะ: {stage?.label} ({stage?.desc})</p>
            <p>• โปรตีน: {stage?.protein}</p>
            {profile.weight && <p>• เป้าโปรตีน: {calcProtein(stage, profile.weight)}</p>}
            {profile.hasDiabetes && <p>• เบาหวาน: ระวังน้ำตาล</p>}
            {profile.hasHypertension && <p>• ความดันสูง: เข้มงวด Na มากขึ้น</p>}
            {profile.onKMed && <p>• ยาลด K: เข้มงวด K สูงสุด</p>}
            {profile.onPBinder && <p>• ยาจับ P: เข้มงวด P</p>}
          </div>
          {stage?.notes && (
            <div className="mt-3 space-y-1">
              {stage.notes.map((note, i) => (
                <p key={i} className={`text-xs ${stage.textColor} opacity-80`}>• {note}</p>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-center text-gray-400">
        ข้อมูลนี้ใช้ประกอบการปรึกษาแพทย์เท่านั้น<br />
        ไม่ใช่การวินิจฉัยหรือสั่งการรักษา
      </p>
    </div>
  )
}

function Section({ title, required, children }) {
  return (
    <div>
      <h2 className="text-base font-bold text-gray-800 mb-3">
        {title}
        {required && <span className="text-red-500 ml-1">*</span>}
      </h2>
      {children}
    </div>
  )
}

function ToggleRow({ label, sublabel, checked, onChange, color }) {
  const colors = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
  }
  const activeColor = color ? colors[color] : 'bg-sky-500'

  return (
    <button
      onClick={onChange}
      className={`w-full flex items-start justify-between p-3.5 rounded-xl border-2 transition-all ${
        checked ? 'bg-gray-50 border-gray-400' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex-1 text-left pr-3">
        <div className={`text-sm font-semibold ${checked ? 'text-gray-900' : 'text-gray-700'}`}>{label}</div>
        {sublabel && <div className="text-xs text-gray-500 mt-0.5">{sublabel}</div>}
      </div>
      <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 mt-0.5 ${checked ? activeColor : 'bg-gray-200'}`}>
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
    </button>
  )
}

function calcProtein(stage, weight) {
  const w = parseFloat(weight)
  if (!w) return ''
  const ranges = { A: [0.8, 0.8], B: [0.6, 0.8], C: [0.6, 0.8], D: [0.3, 0.6], E: [1.0, 1.2], F: [1.0, 1.3] }
  const r = ranges[stage.id]
  if (!r) return ''
  const lo = (w * r[0]).toFixed(0)
  const hi = (w * r[1]).toFixed(0)
  if (lo === hi) return `${lo} g/วัน`
  return `${lo}–${hi} g/วัน`
}
