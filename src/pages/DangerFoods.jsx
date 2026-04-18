import { useState } from 'react'
import { BANNED_FOODS, CAUTION_HERBS } from '../data/foods'
import { myths } from '../data/stageInfo'

const TABS = ['อาหารต้องห้าม', 'สมุนไพรระวัง', 'ความเชื่อผิดๆ']

export default function DangerFoods() {
  const [tab, setTab] = useState(0)

  return (
    <div>
      {/* Header */}
      <div className="p-4 bg-white border-b border-gray-100">
        <h1 className="text-xl font-extrabold text-gray-900">🚫 อาหารที่ต้องระวัง</h1>
        <p className="text-sm text-gray-500 mt-0.5">ข้อมูลสำคัญที่ผู้ป่วยไตต้องรู้</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white">
        {TABS.map((t, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors ${
              tab === i ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-4">
        {tab === 0 && <BannedFoodsTab />}
        {tab === 1 && <HerbsTab />}
        {tab === 2 && <MythsTab />}
      </div>
    </div>
  )
}

function BannedFoodsTab() {
  return (
    <>
      <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4">
        <p className="text-sm font-bold text-red-800 flex items-center gap-2">
          <span className="text-xl">🚨</span>
          อาหารต่อไปนี้ ห้ามกินเด็ดขาด แม้แต่ปริมาณน้อยก็อันตราย
        </p>
      </div>

      {BANNED_FOODS.map((food) => (
        <div key={food.name} className="bg-white border-2 border-red-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl flex-shrink-0">{food.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-red-900">{food.name}</h3>
                <span className="text-xs font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">ห้ามกิน</span>
              </div>
              <div className="mt-1.5 space-y-1">
                <div className="flex items-start gap-1.5">
                  <span className="text-xs font-semibold text-gray-500 mt-0.5">สาเหตุ:</span>
                  <span className="text-sm text-gray-700">{food.reason}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-xs font-semibold text-red-600 mt-0.5">อันตราย:</span>
                  <span className="text-sm font-semibold text-red-700">{food.danger}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Low sodium trap */}
      <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-4 space-y-3">
        <h3 className="font-extrabold text-orange-900 flex items-center gap-2">
          <span>⚠️</span> กับดักเครื่องปรุงโลโซเดียม
        </h3>
        <TrapRow
          name="ซีอิ๊วโลโซเดียม"
          detail="1 ช้อนโต๊ะ = K 700 mg"
          note="ใช้ KCl แทน NaCl → K พุ่งสูงอันตราย"
        />
        <TrapRow
          name="น้ำปลาโลโซเดียม"
          detail="1 ช้อนโต๊ะ = K 900 mg"
          note="อันตรายกว่าน้ำปลาปกติสำหรับคนไต"
        />
        <TrapRow
          name="เกลือทดแทน (เกลือโพแทสเซียม)"
          detail="= KCl บริสุทธิ์"
          note="ห้ามใช้เด็ดขาด! K พุ่งสูงถึงระดับอันตราย"
          danger
        />
      </div>

      {/* High oxalate */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4">
        <h3 className="font-extrabold text-yellow-900 mb-3 flex items-center gap-2">
          <span>⚠️</span> Oxalate สูง — ระวังมาก
        </h3>
        <div className="flex flex-wrap gap-2">
          {['ผักโขม', 'บีทรูท', 'มันสำปะหลัง', 'เผือก', 'อัลมอนด์', 'โกโก้', 'แครนเบอร์รีเข้มข้น'].map((item) => (
            <span key={item} className="text-sm font-semibold bg-yellow-200 text-yellow-900 px-2.5 py-1 rounded-full">
              {item}
            </span>
          ))}
        </div>
        <p className="text-xs text-yellow-800 mt-3 font-medium">
          Oxalate สูง → สะสมในไต → เร่งไตวายและนิ่ว
        </p>
      </div>
    </>
  )
}

function HerbsTab() {
  return (
    <>
      <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4">
        <p className="text-sm font-bold text-red-800">
          🌿 สมุนไพรและยาแผนโบราณบางชนิดเป็นอันตรายต่อไต "ธรรมชาติ" ไม่ได้แปลว่า "ปลอดภัย"
        </p>
      </div>

      <div className="space-y-3">
        {CAUTION_HERBS.map((herb) => (
          <div key={herb.name} className="bg-white border-2 border-orange-200 rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-gray-900 text-base">{herb.name}</h3>
              <span className="text-xs font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full flex-shrink-0 ml-2">ระวัง</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{herb.reason}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <h3 className="font-bold text-blue-800 mb-2">💡 คำแนะนำ</h3>
        <div className="space-y-1.5 text-sm text-blue-900">
          <p>• ถามแพทย์โรคไตก่อนกินสมุนไพรหรืออาหารเสริมทุกชนิด</p>
          <p>• ถ่ายรูปฉลากผลิตภัณฑ์ก่อนซื้อ ตรวจหาคำว่า K, P, Ca, phosphate, potassium</p>
          <p>• ไม่มีสมุนไพรไทยชนิดใดที่พิสูจน์แล้วว่ารักษาโรคไตได้ในมนุษย์</p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
        <h3 className="font-bold text-gray-800 mb-3">อาหารเสริมที่ต้องระวัง</h3>
        <div className="space-y-2">
          {[
            { name: 'คอลลาเจน', issue: 'โปรตีนแฝง นับรวมกับโปรตีนในมื้ออาหาร' },
            { name: 'แคลเซียมเม็ด (ซื้อเอง)', issue: 'Ca + P สูง → หลอดเลือดหินปูน' },
            { name: 'วิตามินซีเม็ดฟู่', issue: 'Na สูง + oxalate → นิ่ว' },
            { name: 'นมผง/โปรตีนเชค', issue: 'P+K+โปรตีน ครบสามเด้ง' },
            { name: 'วิตามินรวม (ซื้อเอง)', issue: 'K, P, Ca อาจเกิน ต้องถามแพทย์' },
            { name: 'กลูโคซามีน', issue: 'บางสูตรมี Na+KCl แฝง' },
          ].map((item) => (
            <div key={item.name} className="flex items-start gap-2 text-sm">
              <span className="text-red-500 font-bold flex-shrink-0">•</span>
              <div>
                <span className="font-semibold text-gray-800">{item.name}</span>
                <span className="text-gray-500 ml-1">— {item.issue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function MythsTab() {
  return (
    <>
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-2">
        <p className="text-sm font-semibold text-gray-700">
          ❌ ความเชื่อผิดๆ ที่พบบ่อยในผู้ป่วยโรคไต — รู้ไว้ป้องกันได้
        </p>
      </div>

      {myths.map((myth, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="bg-red-50 px-4 py-3 flex items-start gap-2">
            <span className="text-red-500 font-extrabold text-lg flex-shrink-0">✗</span>
            <p className="text-sm font-semibold text-red-900">{myth.wrong}</p>
          </div>
          <div className="bg-green-50 px-4 py-3 flex items-start gap-2">
            <span className="text-green-600 font-extrabold text-lg flex-shrink-0">✓</span>
            <p className="text-sm font-semibold text-green-900">{myth.right}</p>
          </div>
        </div>
      ))}
    </>
  )
}

function TrapRow({ name, detail, note, danger }) {
  return (
    <div className={`rounded-xl p-3 border ${danger ? 'bg-red-100 border-red-300' : 'bg-white border-orange-200'}`}>
      <div className="flex items-center justify-between">
        <span className={`font-bold text-sm ${danger ? 'text-red-900' : 'text-gray-900'}`}>{name}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${danger ? 'bg-red-600 text-white' : 'bg-orange-200 text-orange-900'}`}>
          {detail}
        </span>
      </div>
      <p className={`text-xs mt-1 ${danger ? 'text-red-800 font-semibold' : 'text-gray-600'}`}>{note}</p>
    </div>
  )
}
