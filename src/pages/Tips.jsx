import { useState } from 'react'
import { tips, tipCategories } from '../data/tips'

const CAT_COLORS = {
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  green: 'bg-green-100 text-green-800 border-green-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  pink: 'bg-pink-100 text-pink-800 border-pink-200',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  teal: 'bg-teal-100 text-teal-800 border-teal-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  rose: 'bg-rose-100 text-rose-800 border-rose-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
}

const CARD_BG = {
  purple: 'bg-purple-50 border-purple-200',
  red: 'bg-red-50 border-red-200',
  orange: 'bg-orange-50 border-orange-200',
  yellow: 'bg-amber-50 border-amber-200',
  green: 'bg-green-50 border-green-200',
  blue: 'bg-blue-50 border-blue-200',
  pink: 'bg-pink-50 border-pink-200',
  indigo: 'bg-indigo-50 border-indigo-200',
  teal: 'bg-teal-50 border-teal-200',
  amber: 'bg-amber-50 border-amber-200',
  rose: 'bg-rose-50 border-rose-200',
  gray: 'bg-gray-50 border-gray-200',
}

export default function Tips() {
  const [selectedCat, setSelectedCat] = useState(null)
  const [flashcard, setFlashcard] = useState(null)

  const catData = tipCategories.find((c) => c.id === selectedCat)
  const filteredTips = selectedCat ? tips.filter((t) => t.cat === selectedCat) : tips

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-100">
        <h1 className="text-xl font-extrabold text-gray-900">💡 คำจำง่าย</h1>
        <p className="text-sm text-gray-500 mt-0.5">เคล็ดลับอาหารจากหมอโรคไต กดการ์ดเพื่ออ่าน</p>
      </div>

      {/* Category tabs */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <CatChip
            label="ทั้งหมด"
            active={!selectedCat}
            onClick={() => setSelectedCat(null)}
            color="gray"
          />
          {tipCategories.map((c) => (
            <CatChip
              key={c.id}
              label={`${c.icon} ${c.label}`}
              active={selectedCat === c.id}
              onClick={() => setSelectedCat(selectedCat === c.id ? null : c.id)}
              color={c.color}
            />
          ))}
        </div>
      </div>

      {/* Tips grid */}
      <div className="p-4">
        {selectedCat && catData && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xl">{catData.icon}</span>
            <h2 className="font-bold text-gray-800">{catData.label}</h2>
            <span className="text-sm text-gray-400">({filteredTips.length} ข้อ)</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {filteredTips.map((tip) => {
            const cat = tipCategories.find((c) => c.id === tip.cat)
            const bgClass = cat ? CARD_BG[cat.color] : 'bg-gray-50 border-gray-200'
            const chipClass = cat ? CAT_COLORS[cat.color] : 'bg-gray-100 text-gray-700'
            return (
              <button
                key={tip.id}
                onClick={() => setFlashcard(tip)}
                className={`text-left rounded-2xl border-2 p-4 ${bgClass} transition-all active:scale-[0.98]`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{cat?.icon || '💡'}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 leading-snug text-base">{tip.text}</p>
                    <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full border ${chipClass}`}>
                      {cat?.label || tip.cat}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Flashcard modal */}
      {flashcard && (
        <FlashcardModal tip={flashcard} onClose={() => setFlashcard(null)} />
      )}
    </div>
  )
}

function FlashcardModal({ tip, onClose }) {
  const cat = tipCategories.find((c) => c.id === tip.cat)
  const bgClass = cat ? CARD_BG[cat.color] : 'bg-gray-50 border-gray-200'

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className={`rounded-3xl border-2 p-8 w-full max-w-sm text-center ${bgClass} shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-5xl mb-4">{cat?.icon || '💡'}</div>
        <p className="text-xl font-extrabold text-gray-900 leading-snug">{tip.text}</p>
        <div className="mt-4 text-sm text-gray-500">{cat?.label}</div>
        <div className="mt-2 text-xs text-gray-400">— คู่มืออาหาร CKD โดยแพทย์โรคไต —</div>
        <button
          onClick={onClose}
          className="mt-6 bg-gray-900 text-white px-6 py-2.5 rounded-full font-semibold text-sm"
        >
          ปิด
        </button>
      </div>
    </div>
  )
}

function CatChip({ label, active, onClick, color }) {
  const activeClass = `bg-${color}-600 text-white border-${color}-600`
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 text-sm font-medium px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
        active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'
      }`}
    >
      {label}
    </button>
  )
}
