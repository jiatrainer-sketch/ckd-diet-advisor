import { useState, useMemo } from 'react'
import { foods, CATEGORIES, getFoodSafety, getKLevel, getPLevel, getNaLevel } from '../data/foods'

const SAFETY_CONFIG = {
  safe: { label: 'กินได้', icon: '✅', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', badge: 'bg-green-100 text-green-800' },
  caution: { label: 'ระวัง', icon: '⚠️', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', badge: 'bg-yellow-100 text-yellow-800' },
  danger: { label: 'หลีกเลี่ยง', icon: '🚫', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-100 text-red-800' },
  unknown: { label: 'ตั้งโปรไฟล์ก่อน', icon: '❓', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-600' },
}

const K_COLOR = { low: 'bg-green-100 text-green-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-red-100 text-red-800' }
const K_LABEL = { low: 'K ต่ำ', medium: 'K ปานกลาง', high: 'K สูง' }

export default function FoodSearch({ profile }) {
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [safeFilter, setSafeFilter] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)

  const hasProfile = !!profile.stage

  const results = useMemo(() => {
    return foods
      .filter((f) => {
        const matchQuery = !query || f.name.toLowerCase().includes(query.toLowerCase())
        const matchCat = !catFilter || f.category === catFilter
        if (!matchQuery || !matchCat) return false
        if (safeFilter && hasProfile) {
          const safety = getFoodSafety(f, profile)
          return safety.level === safeFilter
        }
        return true
      })
      .map((f) => ({ ...f, safety: getFoodSafety(f, profile) }))
  }, [query, catFilter, safeFilter, profile])

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="sticky top-0 bg-white border-b border-gray-100 p-4 space-y-3 z-10">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาอาหาร เช่น กล้วย ลูกชิ้น..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-sky-400 bg-gray-50"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">
              ×
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <FilterBtn label="ทั้งหมด" active={!catFilter} onClick={() => setCatFilter('')} />
          {CATEGORIES.map((c) => (
            <FilterBtn key={c.id} label={`${c.icon} ${c.label}`} active={catFilter === c.id} onClick={() => setCatFilter(catFilter === c.id ? '' : c.id)} />
          ))}
        </div>

        {/* Safety filter */}
        {hasProfile && (
          <div className="flex gap-2">
            <FilterBtn label="✅ กินได้" active={safeFilter === 'safe'} onClick={() => setSafeFilter(safeFilter === 'safe' ? '' : 'safe')} color="green" />
            <FilterBtn label="⚠️ ระวัง" active={safeFilter === 'caution'} onClick={() => setSafeFilter(safeFilter === 'caution' ? '' : 'caution')} color="yellow" />
            <FilterBtn label="🚫 หลีกเลี่ยง" active={safeFilter === 'danger'} onClick={() => setSafeFilter(safeFilter === 'danger' ? '' : 'danger')} color="red" />
          </div>
        )}

        {!hasProfile && (
          <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            ตั้งค่าโปรไฟล์เพื่อดูว่าอาหารปลอดภัยสำหรับคุณไหม
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {results.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-2">🍽️</div>
            <div>ไม่พบอาหารที่ค้นหา</div>
          </div>
        ) : (
          results.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              hasProfile={hasProfile}
              onClick={() => setSelectedFood(food)}
            />
          ))
        )}
      </div>

      {/* Detail modal */}
      {selectedFood && (
        <FoodDetail food={selectedFood} hasProfile={hasProfile} onClose={() => setSelectedFood(null)} />
      )}
    </div>
  )
}

function FoodCard({ food, hasProfile, onClick }) {
  const safety = food.safety
  const cfg = SAFETY_CONFIG[safety.level]
  const kLevel = getKLevel(food.k)

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 p-4 ${cfg.bg} ${cfg.border} transition-all active:scale-98`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-gray-900">{food.name}</span>
            {food.warning && (
              <span className="text-xs font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-md">⚠️</span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{food.unit}</div>
        </div>
        {hasProfile && (
          <span className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full ${cfg.badge}`}>
            {cfg.icon} {cfg.label}
          </span>
        )}
      </div>

      {/* Nutrient bars */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        <NutrientTag label={K_LABEL[kLevel]} color={K_COLOR[kLevel]} />
        <NutrientTag label={`P ${food.p}`} color={food.p > 200 ? 'bg-red-100 text-red-800' : food.p > 100 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'} />
        <NutrientTag label={`Na ${food.na}`} color={food.na > 300 ? 'bg-red-100 text-red-800' : food.na > 100 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'} />
        <NutrientTag label={`โปร ${food.protein}g`} color="bg-blue-100 text-blue-800" />
      </div>

      {/* Issues */}
      {hasProfile && safety.issues.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {safety.issues.map((issue, i) => (
            <span key={i} className={`text-xs px-2 py-0.5 rounded-full font-medium ${issue.severity === 'danger' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
              {issue.type} {issue.severity === 'danger' ? 'สูงมาก' : 'ต้องระวัง'}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}

function FoodDetail({ food, hasProfile, onClose }) {
  const safety = food.safety
  const cfg = SAFETY_CONFIG[safety.level]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg mx-auto rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">{food.name}</h2>
            <p className="text-sm text-gray-500">ต่อ 100g (หน่วย: {food.unit})</p>
          </div>
          <button onClick={onClose} className="text-gray-400 text-2xl font-bold w-8 h-8 flex items-center justify-center">
            ×
          </button>
        </div>

        {/* Safety badge */}
        {hasProfile && (
          <div className={`rounded-2xl p-4 mb-4 ${cfg.bg} border ${cfg.border}`}>
            <div className={`text-lg font-extrabold ${cfg.text}`}>
              {cfg.icon} {cfg.label}
            </div>
            {safety.issues.length > 0 && (
              <div className="mt-2 space-y-1">
                {safety.issues.map((issue, i) => (
                  <div key={i} className={`text-sm font-medium ${cfg.text}`}>
                    • {issue.type}: {issue.severity === 'danger' ? 'สูงอันตราย' : 'ต้องระวัง'}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Warning */}
        {food.warning && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-3 mb-4">
            <p className="text-sm font-bold text-red-800">⚠️ {food.warning}</p>
          </div>
        )}

        {/* Nutrients */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <NutrientBox label="โพแทสเซียม (K)" value={food.k} unit="mg" threshold={[100, 250]} />
          <NutrientBox label="ฟอสฟอรัส (P)" value={food.p} unit="mg" threshold={[100, 200]} />
          <NutrientBox label="โซเดียม (Na)" value={food.na} unit="mg" threshold={[100, 300]} />
          <NutrientBox label="โปรตีน" value={food.protein} unit="g" threshold={[5, 15]} neutral />
          <NutrientBox label="พลังงาน" value={food.kcal} unit="kcal" neutral />
        </div>

        {/* Tip */}
        {food.tip && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-sm text-blue-800 font-medium">💡 {food.tip}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function NutrientBox({ label, value, unit, threshold, neutral }) {
  let color = 'bg-gray-50 text-gray-700 border-gray-200'
  if (!neutral && threshold) {
    if (value > threshold[1]) color = 'bg-red-50 text-red-800 border-red-200'
    else if (value > threshold[0]) color = 'bg-yellow-50 text-yellow-800 border-yellow-200'
    else color = 'bg-green-50 text-green-800 border-green-200'
  }
  return (
    <div className={`rounded-xl border p-3 ${color}`}>
      <div className="text-xs font-semibold opacity-70">{label}</div>
      <div className="text-xl font-extrabold mt-0.5">{value}</div>
      <div className="text-xs">{unit}/100g</div>
    </div>
  )
}

function NutrientTag({ label, color }) {
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{label}</span>
}

function FilterBtn({ label, active, onClick, color }) {
  const colors = {
    green: active ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-700 border-green-300',
    yellow: active ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-yellow-700 border-yellow-300',
    red: active ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-700 border-red-300',
  }
  const defaultColor = active ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 border-gray-200'
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 text-sm font-medium px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${color ? colors[color] : defaultColor}`}
    >
      {label}
    </button>
  )
}
