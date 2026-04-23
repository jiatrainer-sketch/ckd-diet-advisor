import { useState } from 'react'
import { registerPatient, hasSupabase } from '../lib/patient'

const STAGES = [
  { value: '', label: 'ยังไม่รู้ (จากการคัดกรอง)' },
  { value: '2',  label: 'Stage 2 (eGFR 60-89)' },
  { value: '3a', label: 'Stage 3a (eGFR 45-59)' },
  { value: '3b', label: 'Stage 3b (eGFR 30-44)' },
  { value: '4',  label: 'Stage 4 (eGFR 15-29)' },
  { value: '5',  label: 'Stage 5 (eGFR <15)' },
  { value: '5d', label: 'Stage 5d (ฟอกไต)' },
]

export default function Register({ profile, onDone }) {
  const [form, setForm] = useState({
    name:     '',
    surname:  '',
    phone:    '',
    stage:    profile?.stage || '',
    hasDm:    profile?.hasDiabetes || false,
    hasHtn:   profile?.hasHypertension || false,
    pdpa:     false,
    isPilot:  false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    const name    = form.name.trim().slice(0, 80)
    const surname = form.surname.trim().slice(0, 80)
    const phone   = form.phone.trim().slice(0, 20)

    if (!name || !surname) {
      setError('กรุณากรอกชื่อ-นามสกุล'); return
    }
    if (phone && !/^[0-9+\-() ]{8,20}$/.test(phone)) {
      setError('เบอร์โทรไม่ถูกต้อง (ใช้ตัวเลข 8–20 หลัก)'); return
    }
    if (!form.pdpa) {
      setError('กรุณายินยอม PDPA ก่อน'); return
    }
    setLoading(true); setError('')
    const result = await registerPatient({
      name, surname, phone,
      ckdStage:  form.stage,
      hasDm:     form.hasDm,
      hasHtn:    form.hasHtn,
      riskLevel: profile?.riskLevel,
      albLevel:  profile?.albLevel,
      isPilot:   form.isPilot,
    })
    setLoading(false)
    if (result.error) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่'); return
    }
    onDone(result.data)
  }

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-xl font-extrabold text-sky-700">📋 ลงทะเบียนบันทึกอาหาร</h1>
        <p className="text-sm text-gray-500 mt-0.5">เพื่อติดตามการคุมอาหารและให้หมอแนะนำได้</p>
      </div>

      {!hasSupabase && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3">
          <p className="text-xs font-bold text-amber-800">📴 โหมดเครื่องเดียว</p>
          <p className="text-xs text-amber-700 mt-0.5">
            ข้อมูลเก็บเฉพาะในเครื่องนี้ (ยังไม่ได้ตั้ง cloud) — ลบเบราว์เซอร์ = ข้อมูลหาย
          </p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">ชื่อ *</label>
            <input
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sky-500"
              placeholder="สมชาย"
              maxLength={80}
              value={form.name}
              onChange={e => set('name', e.target.value.slice(0, 80))}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">นามสกุล *</label>
            <input
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sky-500"
              placeholder="ใจดี"
              maxLength={80}
              value={form.surname}
              onChange={e => set('surname', e.target.value.slice(0, 80))}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">เบอร์โทร (สำหรับติดตามผล)</label>
          <input
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sky-500"
            placeholder="08x-xxx-xxxx"
            type="tel"
            inputMode="tel"
            maxLength={20}
            pattern="[0-9+\-() ]{8,20}"
            value={form.phone}
            onChange={e => set('phone', e.target.value.slice(0, 20))}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-gray-600 block mb-1">ระยะโรคไต</label>
          <select
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sky-500 bg-white"
            value={form.stage}
            onChange={e => set('stage', e.target.value)}
          >
            {STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded accent-sky-600"
              checked={form.hasDm} onChange={e => set('hasDm', e.target.checked)} />
            เบาหวาน
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded accent-sky-600"
              checked={form.hasHtn} onChange={e => set('hasHtn', e.target.checked)} />
            ความดันสูง
          </label>
        </div>

        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded accent-sky-600 mt-0.5 flex-shrink-0"
            checked={form.isPilot} onChange={e => set('isPilot', e.target.checked)} />
          <span className="text-gray-600">เข้าร่วมโครงการทดสอบ (Pilot 3 เดือน) — ได้ใช้งานฟรีสูงสุด 5 รูป/วัน</span>
        </label>
      </div>

      {/* PDPA */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
        <div className="font-bold text-amber-800 text-sm mb-2">📋 ความยินยอมตาม PDPA</div>
        <div className="text-xs text-amber-700 space-y-1 mb-3">
          <p>W Medical Hospital จะเก็บข้อมูลของคุณ ได้แก่:</p>
          <p>✅ ชื่อ-นามสกุล เบอร์โทร ระยะโรคไต โรคร่วม</p>
          <p>✅ ข้อมูลอาหารที่บันทึกรายวัน</p>
          <p><b>วัตถุประสงค์:</b> เพื่อติดตามการคุมอาหาร และให้แพทย์แนะนำได้</p>
          <p><b>สิทธิ์:</b> คุณสามารถขอดู แก้ไข หรือลบข้อมูลได้ทุกเมื่อ</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-bold text-amber-900 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded accent-amber-600"
            checked={form.pdpa} onChange={e => set('pdpa', e.target.checked)} />
          ฉันยินยอมให้เก็บและใช้ข้อมูลตามที่แจ้งไว้ข้างต้น
        </label>
      </div>

      {error && <p className="text-red-600 text-sm font-medium text-center">{error}</p>}

      <button
        onClick={submit}
        disabled={loading || !form.pdpa}
        className="w-full bg-sky-600 text-white font-bold py-4 rounded-2xl text-base disabled:opacity-50"
      >
        {loading ? 'กำลังลงทะเบียน...' : '✅ ลงทะเบียน — เริ่มบันทึกอาหาร'}
      </button>

      <p className="text-center text-xs text-gray-400">
        ข้อมูลเข้ารหัสและเก็บอย่างปลอดภัย · ไม่แชร์กับบุคคลที่สาม
      </p>
    </div>
  )
}
