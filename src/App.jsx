import { useState, useEffect } from 'react'
import Home from './pages/Home'
import FoodSearch from './pages/FoodSearch'
import Tips from './pages/Tips'
import Profile from './pages/Profile'
import DangerFoods from './pages/DangerFoods'
import Camera from './pages/Camera'
import Screening from './pages/Screening'
import Register from './pages/Register'
import FoodDiary from './pages/FoodDiary'
import DoctorDashboard from './pages/DoctorDashboard'
import { getLocalPatientId, getPatient } from './lib/patient'

// ── Icons ─────────────────────────────────────────────────────────────
function HomeIcon({ active }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active?'currentColor':'none'} stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.092 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
}
function SearchIcon({ active }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active?'currentColor':'none'} stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
}
function DiaryIcon({ active }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active?'currentColor':'none'} stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
}
function TipsIcon({ active }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active?'currentColor':'none'} stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" /></svg>
}
function UserIcon({ active }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={active?'currentColor':'none'} stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
}

const TABS = [
  { id: 'home',    label: 'หน้าหลัก',   icon: HomeIcon },
  { id: 'food',    label: 'ค้นหาอาหาร', icon: SearchIcon },
  { id: 'diary',   label: 'บันทึก',      icon: DiaryIcon },
  { id: 'tips',    label: 'คำจำง่าย',   icon: TipsIcon },
  { id: 'profile', label: 'โปรไฟล์',    icon: UserIcon },
]

const DEFAULT_PROFILE = {
  stage: '', weight: '', kStatus: 'unknown',
  onKMed: false, onPBinder: false, onMetformin: false,
  fluidRestrict: false, hasDiabetes: false,
  hasHypertension: false, hasHeart: false, hasGout: false,
}

export default function App() {
  const params            = new URLSearchParams(window.location.search)
  const fromScreeningQR   = params.get('from') === 'screening'
  const isDoctor          = params.get('doctor') === '1'
  const screeningRisk     = params.get('risk') || ''
  const screeningAlb      = params.get('alb')  || ''

  const [tab, setTab]           = useState(isDoctor ? 'doctor' : fromScreeningQR ? 'screening' : 'home')
  const [patientId, setPatientId] = useState(() => getLocalPatientId())
  const [patient, setPatient]   = useState(null)
  const [showRegister, setShowRegister] = useState(false)

  const [profile, setProfile] = useState(() => {
    if (params.get('stage')) {
      return { ...DEFAULT_PROFILE, stage: params.get('stage')||'', hasDiabetes: params.get('dm')==='1', hasHypertension: params.get('htn')==='1', kStatus: params.get('k')||'unknown', onKMed: params.get('km')==='1', onPBinder: params.get('pb')==='1', fluidRestrict: params.get('fl')==='1' }
    }
    if (fromScreeningQR) {
      return { ...DEFAULT_PROFILE, hasDiabetes: params.get('dm')==='1', hasHypertension: params.get('htn')==='1' }
    }
    try { const s = localStorage.getItem('ckd_profile'); return s ? JSON.parse(s) : DEFAULT_PROFILE } catch { return DEFAULT_PROFILE }
  })

  useEffect(() => { localStorage.setItem('ckd_profile', JSON.stringify(profile)) }, [profile])

  useEffect(() => {
    if (patientId) getPatient(patientId).then(p => { if (p) setPatient(p) })
  }, [patientId])

  const updateProfile = (updates) => setProfile(prev => ({ ...prev, ...updates }))

  // Doctor view — ไม่แสดง navbar
  if (isDoctor || tab === 'doctor') return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto">
      <DoctorDashboard />
    </div>
  )

  // Diary tab → ต้องลงทะเบียนก่อน
  const handleDiaryTab = () => {
    if (patientId) { setTab('diary') }
    else { setShowRegister(true) }
  }

  const onRegistered = (data) => {
    setPatientId(data.id)
    setPatient(data)
    setShowRegister(false)
    setTab('diary')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      <main className="flex-1 overflow-y-auto pb-20">
        {showRegister && (
          <Register profile={profile} onDone={onRegistered} />
        )}
        {!showRegister && tab === 'screening' && (
          <Screening risk={screeningRisk} alb={screeningAlb} profile={profile}
            onGoFood={() => setTab('food')} onGoCamera={() => setTab('camera')} />
        )}
        {!showRegister && tab === 'home'    && <Home profile={profile} onGoProfile={() => setTab('profile')} onGoFood={() => setTab('food')} onGoCamera={() => setTab('camera')} onGoTips={() => setTab('tips')} />}
        {!showRegister && tab === 'food'    && <FoodSearch profile={profile} />}
        {!showRegister && tab === 'diary'   && patientId && <FoodDiary patientId={patientId} profile={patient || profile} onGoCamera={() => setTab('camera')} />}
        {!showRegister && tab === 'camera'  && <Camera />}
        {!showRegister && tab === 'tips'    && <Tips />}
        {!showRegister && tab === 'danger'  && <DangerFoods />}
        {!showRegister && tab === 'profile' && <Profile profile={profile} updateProfile={updateProfile} />}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 flex z-50">
        {TABS.map((t) => {
          const active = tab === t.id && !showRegister
          const isDiary = t.id === 'diary'
          return (
            <button key={t.id}
              onClick={() => isDiary ? handleDiaryTab() : setTab(t.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${active ? 'text-sky-600' : 'text-gray-400 hover:text-gray-600'}`}>
              <t.icon active={active} />
              <span className="leading-tight">{t.label}</span>
              {isDiary && !patientId && <span className="text-xs text-amber-500 leading-none">ลงทะเบียน</span>}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
