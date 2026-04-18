import { useState, useEffect } from 'react'
import { getAllPatients, getPatientLogs, addDoctorNote, getDoctorNotes } from '../lib/patient'

const DOCTOR_PIN = '4155'

function daysSince(dateStr) {
  if (!dateStr) return 99
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / 86400000)
}

function complianceColor(pct) {
  if (pct >= 80) return 'text-green-600 bg-green-100'
  if (pct >= 50) return 'text-amber-600 bg-amber-100'
  return 'text-red-600 bg-red-100'
}

// คำนวณ compliance จาก logs 7 วัน (กี่วันมีบันทึก)
function calcCompliance(logs) {
  const days = new Set(logs.map(l => l.logged_at?.split('T')[0])).size
  return { days, pct: Math.round((days / 7) * 100) }
}

// หา alert flags จาก logs
function calcAlerts(logs, stage) {
  const isLate = ['4','5','5d'].includes(stage)
  const naLimit = 2000, kLimit = isLate ? 1500 : 2000, pLimit = isLate ? 700 : 900
  const totals = logs.reduce((a, l) => ({
    na: a.na + (l.sodium || 0), k: a.k + (l.potassium || 0), p: a.p + (l.phosphorus || 0),
  }), { na: 0, k: 0, p: 0 })
  const avgNa = Math.round(totals.na / 7)
  const avgK  = Math.round(totals.k  / 7)
  const avgP  = Math.round(totals.p  / 7)
  const flags = []
  if (avgNa > naLimit) flags.push('Na สูง')
  if (avgK  > kLimit)  flags.push('K สูง')
  if (avgP  > pLimit)  flags.push('P สูง')
  return { flags, avgNa, avgK, avgP, naLimit, kLimit, pLimit }
}

function PatientCard({ p, logs, onSelect }) {
  const inactive   = daysSince(p.last_active) >= 3
  const riskColor  = p.risk_level === 'high' ? 'bg-red-100 text-red-700' : p.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
  const { days, pct } = calcCompliance(logs || [])
  const { flags }     = calcAlerts(logs || [], p.ckd_stage)

  return (
    <button onClick={() => onSelect(p)}
      className="w-full text-left bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-bold text-gray-900">{p.name} {p.surname}</div>
          <div className="text-xs text-gray-500 mt-0.5">{p.phone || 'ไม่มีเบอร์'} · ลงทะเบียน {new Date(p.registered_at).toLocaleDateString('th-TH')}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {p.risk_level && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${riskColor}`}>{p.risk_level === 'high' ? '🔴 High' : p.risk_level === 'medium' ? '🟡 Med' : '🟢 Low'}</span>}
          {inactive && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">⚠️ {daysSince(p.last_active)}ว</span>}
        </div>
      </div>

      {/* Alert badges */}
      {flags.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {flags.map(f => (
            <span key={f} className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">⚠️ {f}</span>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-2 flex-wrap items-center">
        {p.ckd_stage && <span className="text-xs bg-sky-100 text-sky-700 font-bold px-2 py-0.5 rounded-full">Stage {p.ckd_stage}</span>}
        {p.has_dm    && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">DM</span>}
        {p.has_htn   && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">HT</span>}
        {p.is_pilot  && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Pilot</span>}
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-auto ${complianceColor(pct)}`}>{days}/7 วัน</span>
      </div>
    </button>
  )
}

function PatientDetail({ p, logs: preloadedLogs, onBack }) {
  const [logs, setLogs]   = useState(preloadedLogs || [])
  const [notes, setNotes] = useState([])
  const [note, setNote]   = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getPatientLogs(p.id, 7).then(setLogs)
    getDoctorNotes(p.id).then(setNotes)
  }, [p.id])

  const { avgNa, avgK, avgP, naLimit, kLimit, pLimit } = calcAlerts(logs, p.ckd_stage)
  const naOk = avgNa <= naLimit, kOk = avgK <= kLimit, pOk = avgP <= pLimit
  const { days, pct } = calcCompliance(logs)

  const saveNote = async () => {
    if (!note.trim()) return
    setSaving(true)
    await addDoctorNote(p.id, note.trim())
    const updated = await getDoctorNotes(p.id)
    setNotes(updated)
    setNote('')
    setSaving(false)
  }

  const byDate = {}
  logs.forEach(l => {
    const d = l.logged_at?.split('T')[0] || 'unknown'
    if (!byDate[d]) byDate[d] = []
    byDate[d].push(l)
  })

  return (
    <div className="pb-4">
      <div className="p-4 bg-white border-b border-gray-100 sticky top-0 z-10 flex items-center gap-3">
        <button onClick={onBack} className="text-sky-600 font-bold text-sm">← กลับ</button>
        <div>
          <div className="font-extrabold text-gray-900">{p.name} {p.surname}</div>
          <div className="text-xs text-gray-400">{p.phone} · Stage {p.ckd_stage || '?'}</div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Compliance */}
        <div className={`rounded-2xl p-3 flex items-center gap-3 ${pct >= 80 ? 'bg-green-50 border border-green-200' : pct >= 50 ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
          <div className={`text-3xl font-extrabold ${pct >= 80 ? 'text-green-700' : pct >= 50 ? 'text-amber-700' : 'text-red-700'}`}>{days}/7</div>
          <div>
            <div className={`font-bold text-sm ${pct >= 80 ? 'text-green-800' : pct >= 50 ? 'text-amber-800' : 'text-red-800'}`}>วันที่บันทึกอาหาร</div>
            <div className={`text-xs ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
              {pct >= 80 ? '✅ Compliance ดี' : pct >= 50 ? '⚠️ Compliance พอไหว' : '❌ บันทึกน้อย ควรติดตาม'}
            </div>
          </div>
        </div>

        {/* 7-day summary */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-800 mb-3">📊 สรุป 7 วันล่าสุด (เฉลี่ย/วัน)</h3>
          <div className="grid grid-cols-3 gap-2">
            <div className={`rounded-xl p-3 ${naOk ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`text-lg font-extrabold ${naOk ? 'text-green-700' : 'text-red-700'}`}>{avgNa}</div>
              <div className="text-xs text-gray-500">🧂 Na mg<br /><span className="text-gray-400">เกณฑ์ &lt;{naLimit}</span></div>
              <div className={`text-xs font-bold mt-1 ${naOk ? 'text-green-600' : 'text-red-600'}`}>{naOk ? '✅ ปกติ' : '❌ เกิน'}</div>
            </div>
            <div className={`rounded-xl p-3 ${kOk ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`text-lg font-extrabold ${kOk ? 'text-green-700' : 'text-red-700'}`}>{avgK}</div>
              <div className="text-xs text-gray-500">🫐 K mg<br /><span className="text-gray-400">เกณฑ์ &lt;{kLimit}</span></div>
              <div className={`text-xs font-bold mt-1 ${kOk ? 'text-green-600' : 'text-red-600'}`}>{kOk ? '✅ ปกติ' : '❌ เกิน'}</div>
            </div>
            <div className={`rounded-xl p-3 ${pOk ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`text-lg font-extrabold ${pOk ? 'text-green-700' : 'text-red-700'}`}>{avgP}</div>
              <div className="text-xs text-gray-500">🦴 P mg<br /><span className="text-gray-400">เกณฑ์ &lt;{pLimit}</span></div>
              <div className={`text-xs font-bold mt-1 ${pOk ? 'text-green-600' : 'text-red-600'}`}>{pOk ? '✅ ปกติ' : '❌ เกิน'}</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-400 text-center">บันทึกแล้ว {logs.length} รายการ ใน 7 วัน</div>
        </div>

        {/* Doctor note */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-800 mb-2">💬 บันทึกของแพทย์</h3>
          {notes.map(n => (
            <div key={n.id} className="bg-sky-50 rounded-xl p-3 text-sm text-sky-800 mb-2">
              <div>{n.note}</div>
              <div className="text-xs text-sky-400 mt-1">{new Date(n.created_at).toLocaleString('th-TH')}</div>
            </div>
          ))}
          <textarea
            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm mt-2 focus:outline-none focus:border-sky-500"
            rows={2} placeholder="บันทึกคำแนะนำ เช่น ลดเค็ม หลีกเลี่ยงกล้วย..."
            value={note} onChange={e => setNote(e.target.value)}
          />
          <button onClick={saveNote} disabled={saving || !note.trim()}
            className="mt-2 w-full bg-sky-600 text-white font-bold py-2.5 rounded-xl disabled:opacity-50 text-sm">
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>

        {/* Food logs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-800 mb-3">🍽️ ประวัติอาหาร 7 วัน</h3>
          {Object.keys(byDate).sort().reverse().map(date => (
            <div key={date} className="mb-3">
              <div className="text-xs font-bold text-gray-500 mb-1">{new Date(date).toLocaleDateString('th-TH', { weekday:'short', month:'short', day:'numeric' })}</div>
              {byDate[date].map(l => (
                <div key={l.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-1.5 mb-1">
                  <span className="font-medium">{l.food_name} {l.photo_used ? '📸' : ''}{l.safety==='custom' ? '✏️' : ''}</span>
                  <span className="text-gray-400">Na:{l.sodium} K:{l.potassium} P:{l.phosphorus}</span>
                </div>
              ))}
            </div>
          ))}
          {logs.length === 0 && <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีบันทึกในช่วงนี้</p>}
        </div>
      </div>
    </div>
  )
}

// ── Export CSV ──────────────────────────────────────────────────────────
function exportCSV(patients, allLogs) {
  const rows = [['ชื่อ','นามสกุล','เบอร์','Stage','DM','HT','Pilot','Risk','วันลงทะเบียน','วันบันทึกล่าสุด','Compliance(วัน/7)','Na เฉลี่ย','K เฉลี่ย','P เฉลี่ย']]
  patients.forEach(p => {
    const logs = allLogs[p.id] || []
    const { days } = calcCompliance(logs)
    const { avgNa, avgK, avgP } = calcAlerts(logs, p.ckd_stage)
    rows.push([
      p.name, p.surname, p.phone || '', p.ckd_stage || '',
      p.has_dm ? 'Y' : 'N', p.has_htn ? 'Y' : 'N', p.is_pilot ? 'Y' : 'N',
      p.risk_level || '', new Date(p.registered_at).toLocaleDateString('th-TH'),
      p.last_active ? new Date(p.last_active).toLocaleDateString('th-TH') : '-',
      days, avgNa, avgK, avgP,
    ])
  })
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = `ckd_patients_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function DoctorDashboard() {
  const [pin, setPin]           = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [patients, setPatients] = useState([])
  const [allLogs, setAllLogs]   = useState({})   // { patientId: logs[] }
  const [selected, setSelected] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')
  const [pinError, setPinError] = useState(false)

  const unlock = () => {
    if (pin === DOCTOR_PIN) { setUnlocked(true); load() }
    else { setPinError(true); setTimeout(() => setPinError(false), 1500) }
  }

  const load = async () => {
    setLoading(true)
    const data = await getAllPatients()
    setPatients(data)
    // โหลด logs ทุกคนพร้อมกัน
    const logsMap = {}
    await Promise.all(data.map(async p => {
      logsMap[p.id] = await getPatientLogs(p.id, 7)
    }))
    setAllLogs(logsMap)
    setLoading(false)
  }

  if (!unlocked) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-sky-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">👨‍⚕️</div>
          <h1 className="text-xl font-extrabold text-sky-800">Doctor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">W Medical Hospital — CKD Diet Tracking</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <input
            type="password" placeholder="กรอก PIN"
            className={`w-full border-2 rounded-xl px-4 py-3 text-center text-lg font-bold tracking-widest focus:outline-none ${
              pinError ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-sky-500'
            }`}
            value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && unlock()}
          />
          {pinError && <p className="text-red-500 text-sm text-center font-medium">PIN ไม่ถูกต้อง</p>}
          <button onClick={unlock} className="w-full bg-sky-600 text-white font-bold py-3 rounded-xl">
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  )

  if (selected) return (
    <PatientDetail p={selected} logs={allLogs[selected.id] || []} onBack={() => setSelected(null)} />
  )

  // กรองและค้นหา
  const filteredPatients = patients
    .filter(p => {
      if (filter === 'pilot')    return p.is_pilot
      if (filter === 'high')     return p.risk_level === 'high'
      if (filter === 'inactive') return daysSince(p.last_active) >= 3
      if (filter === 'alert')    return (allLogs[p.id] || []).length > 0 && calcAlerts(allLogs[p.id] || [], p.ckd_stage).flags.length > 0
      return true
    })
    .filter(p => {
      if (!search.trim()) return true
      const q = search.trim().toLowerCase()
      return (p.name + ' ' + p.surname).toLowerCase().includes(q) || (p.phone || '').includes(q)
    })

  const stats = {
    total:    patients.length,
    pilot:    patients.filter(p => p.is_pilot).length,
    high:     patients.filter(p => p.risk_level === 'high').length,
    inactive: patients.filter(p => daysSince(p.last_active) >= 3).length,
    alert:    patients.filter(p => calcAlerts(allLogs[p.id] || [], p.ckd_stage).flags.length > 0).length,
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="p-4 bg-sky-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold">👨‍⚕️ Doctor Dashboard</h1>
            <p className="text-xs text-sky-200">W Medical Hospital — CKD Diet Tracking</p>
          </div>
          <button onClick={() => exportCSV(patients, allLogs)}
            className="bg-sky-500 text-white text-xs font-bold px-3 py-2 rounded-xl">
            📥 Export CSV
          </button>
        </div>

        {/* Stats tabs */}
        <div className="grid grid-cols-5 gap-1.5 mt-3">
          {[
            { label: 'ทั้งหมด',  val: stats.total,    key: 'all' },
            { label: 'Pilot',    val: stats.pilot,    key: 'pilot' },
            { label: 'High',     val: stats.high,     key: 'high' },
            { label: '⚠️ Alert', val: stats.alert,    key: 'alert' },
            { label: 'ไม่บันทึก', val: stats.inactive, key: 'inactive' },
          ].map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              className={`rounded-xl p-2 text-center transition-all ${filter === s.key ? 'bg-white text-sky-700' : 'bg-sky-600 text-white'}`}>
              <div className="text-lg font-extrabold">{s.val}</div>
              <div className="text-xs leading-tight">{s.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-3">
        <input
          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sky-500 bg-white"
          placeholder="🔍 ค้นหาชื่อ นามสกุล หรือเบอร์โทร..."
          value={search} onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="p-4 space-y-3">
        {loading && <p className="text-center text-gray-400 py-8">กำลังโหลด...</p>}
        {!loading && filteredPatients.length === 0 && (
          <p className="text-center text-gray-400 py-8">ยังไม่มีคนไข้ในกลุ่มนี้</p>
        )}
        {filteredPatients.map(p => (
          <PatientCard key={p.id} p={p} logs={allLogs[p.id] || []} onSelect={setSelected} />
        ))}
      </div>
    </div>
  )
}
