// ฐานข้อมูลอาหารไทย — ค่าโภชนาการต่อ 100g
// k=โพแทสเซียม(mg), p=ฟอสฟอรัส(mg), na=โซเดียม(mg), protein=โปรตีน(g), kcal=พลังงาน
// kLevel: 'low'(<100), 'medium'(100-250), 'high'(>250)

export const CATEGORIES = [
  { id: 'grain', label: 'ข้าว/แป้ง', icon: '🍚' },
  { id: 'veg', label: 'ผัก', icon: '🥦' },
  { id: 'fruit', label: 'ผลไม้', icon: '🍎' },
  { id: 'meat', label: 'เนื้อสัตว์/โปรตีน', icon: '🍗' },
  { id: 'processed', label: 'อาหารแปรรูป', icon: '🌭' },
  { id: 'seasoning', label: 'เครื่องปรุง', icon: '🧂' },
  { id: 'drink', label: 'เครื่องดื่ม', icon: '🥤' },
  { id: 'supplement', label: 'อาหารเสริม', icon: '💊' },
]

export const foods = [
  // ข้าว/แป้ง
  { id: 1, name: 'ข้าวขาวสุก', category: 'grain', k: 29, p: 43, na: 2, protein: 2.7, kcal: 130, unit: '1 ทัพพี (150g)', tip: 'แป้งพื้นฐานที่ปลอดภัยที่สุดสำหรับคนไต' },
  { id: 101, name: 'ข้าวต้ม', category: 'grain', k: 22, p: 30, na: 10, protein: 1.8, kcal: 65, unit: '1 ถ้วย (200g)', tip: 'ย่อยง่าย K และ P ต่ำ เหมาะสำหรับคนไต' },
  { id: 102, name: 'โจ๊ก', category: 'grain', k: 20, p: 28, na: 250, protein: 2.0, kcal: 60, unit: '1 ถ้วย (200g)', tip: 'Na สูงจากซุป ขอแบบไม่ใส่ซอส', warning: 'ระวัง Na จากน้ำซุป' },
  { id: 103, name: 'ข้าวผัด', category: 'grain', k: 80, p: 70, na: 520, protein: 5.0, kcal: 180, unit: '1 จาน (200g)', tip: 'Na สูงจากซีอิ๊วและน้ำมันหอย', warning: 'Na สูงมาก' },
  { id: 104, name: 'ก๋วยเตี๋ยวน้ำ', category: 'grain', k: 60, p: 45, na: 800, protein: 6.0, kcal: 120, unit: '1 ชาม', tip: 'ขอน้ำน้อย ลด Na ได้มาก', warning: 'Na สูงจากน้ำซุป' },
  { id: 105, name: 'ก๋วยเตี๋ยวแห้ง', category: 'grain', k: 55, p: 50, na: 600, protein: 8.0, kcal: 130, unit: '1 ชาม', tip: 'Na ต่ำกว่าแบบน้ำ แต่ยังสูงอยู่' },
  { id: 106, name: 'ผัดไทย', category: 'grain', k: 144, p: 79, na: 337, protein: 8.2, kcal: 160, unit: '1 จาน (200g)', tip: 'K และ P ต่ำกว่าเมนูอื่น แต่ Na ยังต้องระวัง' },
  { id: 107, name: 'ข้าวมันไก่', category: 'grain', k: 280, p: 150, na: 350, protein: 12.0, kcal: 158, unit: '1 จาน (250g)', tip: 'ขอน้ำซุปน้อย ลด Na ได้' },
  { id: 108, name: 'ข้าวหมูแดง', category: 'grain', k: 250, p: 130, na: 600, protein: 10.0, kcal: 170, unit: '1 จาน (250g)', tip: 'Na สูงจากซอสหมูแดง', warning: 'Na สูงมาก' },

  // เมนูแกง/ต้ม
  { id: 200, name: 'แกงจืด', category: 'meat', k: 120, p: 55, na: 350, protein: 3.0, kcal: 35, unit: '1 ถ้วย (200g)', tip: 'เมนูที่ปลอดภัยที่สุด Na ต่ำถ้าปรุงรสน้อย' },
  { id: 201, name: 'ต้มยำกุ้ง', category: 'meat', k: 120, p: 80, na: 480, protein: 6.0, kcal: 60, unit: '1 ถ้วย (200g)', tip: 'Na สูงจากน้ำปลา ขอน้ำซุปน้อย', warning: 'Na สูง' },
  { id: 202, name: 'ต้มยำไก่', category: 'meat', k: 120, p: 80, na: 480, protein: 6.0, kcal: 65, unit: '1 ถ้วย (200g)', tip: 'Na สูงจากน้ำปลา ขอน้ำซุปน้อย', warning: 'Na สูง' },
  { id: 203, name: 'ต้มข่าไก่', category: 'meat', k: 200, p: 90, na: 200, protein: 8.0, kcal: 120, unit: '1 ถ้วย (200g)', tip: 'กะทิให้พลังงานสูง Na ต่ำกว่าต้มยำ' },
  { id: 204, name: 'แกงเขียวหวาน', category: 'meat', k: 200, p: 90, na: 280, protein: 6.0, kcal: 105, unit: '1 ถ้วย (200g)', tip: 'กะทิให้พลังงานสูง Na ปานกลาง' },
  { id: 205, name: 'แกงเผ็ด', category: 'meat', k: 220, p: 90, na: 400, protein: 6.0, kcal: 100, unit: '1 ถ้วย (200g)', tip: 'Na ปานกลาง-สูง กินได้ในปริมาณน้อย', warning: 'Na สูง' },
  { id: 206, name: 'แกงส้ม', category: 'meat', k: 220, p: 80, na: 400, protein: 5.0, kcal: 60, unit: '1 ถ้วย (200g)', tip: 'ไม่มีกะทิ แคลอรี่ต่ำ Na ต้องระวัง', warning: 'Na สูง' },
  { id: 207, name: 'ซุปหน่อไม้', category: 'meat', k: 400, p: 55, na: 350, protein: 2.5, kcal: 40, unit: '1 ถ้วย (200g)', tip: 'K สูงจากหน่อไม้ ระวังในคนไต stage 4-5', warning: 'K สูง' },

  // ผัด
  { id: 210, name: 'ผัดผัก', category: 'meat', k: 350, p: 55, na: 450, protein: 3.0, kcal: 65, unit: '1 จาน (150g)', tip: 'K และ Na สูงจากผักและซีอิ๊ว ลวกผักก่อนผัดช่วยลด K', warning: 'K และ Na สูง' },
  { id: 211, name: 'ผัดกะเพรา', category: 'meat', k: 120, p: 100, na: 320, protein: 8.0, kcal: 140, unit: '1 จาน (150g)', tip: 'Na ปานกลางจากน้ำมันหอยและซีอิ๊ว', warning: 'Na ปานกลาง' },
  { id: 212, name: 'ผัดน้ำมันหอย', category: 'meat', k: 200, p: 80, na: 550, protein: 5.0, kcal: 80, unit: '1 จาน (150g)', tip: 'Na สูงมากจากน้ำมันหอย', warning: 'Na สูงมาก' },

  // ไข่
  { id: 220, name: 'ไข่ต้ม', category: 'meat', k: 126, p: 172, na: 124, protein: 12.6, kcal: 155, unit: '1 ฟอง (50g)', tip: 'Na ต่ำ P ปานกลาง กินได้วันละ 1 ฟอง' },
  { id: 221, name: 'ไข่ดาว', category: 'meat', k: 152, p: 215, na: 207, protein: 13.6, kcal: 196, unit: '1 ฟอง (50g)', tip: 'P และ Na สูงกว่าไข่ต้ม', warning: 'P ปานกลาง' },
  { id: 222, name: 'ไข่เจียว', category: 'meat', k: 123, p: 171, na: 228, protein: 11.6, kcal: 193, unit: '1 ฟอง (60g)', tip: 'Na สูงจากการปรุงรส', warning: 'Na ปานกลาง' },

  // ปลา/เนื้อสัตว์
  { id: 230, name: 'ปลานึ่ง', category: 'meat', k: 382, p: 215, na: 163, protein: 25.4, kcal: 121, unit: '1 ชิ้น (100g)', tip: 'โปรตีนสูง P และ K สูง จำกัดปริมาณ', warning: 'P และ K สูง' },
  { id: 231, name: 'ปลาทอด', category: 'meat', k: 254, p: 152, na: 383, protein: 17.2, kcal: 237, unit: '1 ชิ้น (100g)', tip: 'Na สูงจากการทอดและปรุงรส', warning: 'Na สูง' },
  { id: 232, name: 'ปลาทู', category: 'meat', k: 280, p: 350, na: 90, protein: 24.9, kcal: 136, unit: '1 ตัว (100g)', tip: 'P สูงมาก ระวังในคนไต stage 3b ขึ้นไป', warning: 'P สูงมาก' },
  { id: 233, name: 'ไก่ย่าง', category: 'meat', k: 391, p: 258, na: 52, protein: 30.5, kcal: 151, unit: '100g', tip: 'P และ K สูง Na ต่ำถ้าไม่หมัก', warning: 'P และ K สูง' },
  { id: 234, name: 'หมูย่าง', category: 'meat', k: 451, p: 295, na: 65, protein: 30.4, kcal: 187, unit: '100g', tip: 'P และ K สูงมาก จำกัดปริมาณ', warning: 'P และ K สูงมาก' },
  { id: 235, name: 'หมูพะโล้', category: 'meat', k: 300, p: 150, na: 700, protein: 15.0, kcal: 250, unit: '100g', tip: 'Na สูงมากจากซีอิ๊วและเครื่องเทศ', warning: 'Na สูงมาก' },

  // สลัด/ยำ
  { id: 240, name: 'ส้มตำ', category: 'veg', k: 300, p: 50, na: 600, protein: 2.0, kcal: 50, unit: '1 จาน (150g)', tip: 'Na สูงมากจากน้ำปลาและปูเค็ม K สูงจากมะละกอ', warning: 'Na และ K สูง' },
  { id: 241, name: 'ลาบหมู', category: 'meat', k: 300, p: 160, na: 400, protein: 12.0, kcal: 150, unit: '100g', tip: 'Na ปานกลาง P ปานกลาง กินได้บ้าง', warning: 'Na ปานกลาง' },
  { id: 2, name: 'ข้าวกล้องสุก', category: 'grain', k: 79, p: 77, na: 7, protein: 2.6, kcal: 123, unit: '1 ทัพพี (150g)', tip: 'P สูงกว่าข้าวขาว ไม่เหมาะ CKD ระยะ C-F', warning: 'P สูงกว่าข้าวขาว 2 เท่า' },
  { id: 3, name: 'วุ้นเส้นสุก', category: 'grain', k: 3, p: 2, na: 3, protein: 0.1, kcal: 84, unit: '1 จาน (150g)', tip: 'แป้งที่ดีที่สุดสำหรับคนไต K และ P ต่ำมาก' },
  { id: 4, name: 'เส้นเล็กสุก', category: 'grain', k: 14, p: 26, na: 60, protein: 1.7, kcal: 108, unit: '1 จาน (150g)', tip: 'เส้นก๋วยเตี๋ยวปกติ ใช้ได้ดี' },
  { id: 5, name: 'ขนมจีน', category: 'grain', k: 20, p: 25, na: 20, protein: 2.0, kcal: 107, unit: '1 จับ (100g)', tip: 'ระวังน้ำยาที่ใส่ Na และ K สูง' },
  { id: 6, name: 'สาคู', category: 'grain', k: 2, p: 4, na: 1, protein: 0.1, kcal: 352, unit: '100g', tip: 'แป้งพลังงานสูง K และ P ต่ำมาก เหมาะสำหรับ CKD' },
  { id: 7, name: 'ขนมปังขาว', category: 'grain', k: 100, p: 87, na: 450, protein: 8.0, kcal: 265, unit: '1 แผ่น (30g)', tip: 'Na สูงจากยีสต์และเกลือ จำกัดปริมาณ', warning: 'Na แฝงในทุกแผ่น' },

  // ผัก
  { id: 10, name: 'ผักกวางตุ้ง', category: 'veg', k: 320, p: 35, na: 32, protein: 1.7, kcal: 21, unit: '1 ถ้วย (100g)', tip: 'K สูง ต้องต้มลวกทิ้งน้ำก่อนกิน', warning: 'K สูง — ต้มทิ้งน้ำก่อน' },
  { id: 11, name: 'คะน้า', category: 'veg', k: 228, p: 42, na: 58, protein: 3.3, kcal: 32, unit: '1 ถ้วย (100g)', tip: 'K ปานกลาง-สูง ลวกก่อนผัดช่วยลด K ได้' },
  { id: 12, name: 'ผักบุ้งไทย', category: 'veg', k: 312, p: 39, na: 89, protein: 2.6, kcal: 24, unit: '1 ถ้วย (100g)', tip: 'K สูง ต้มทิ้งน้ำก่อนผัด', warning: 'K สูง — ต้มก่อนผัด' },
  { id: 13, name: 'ตำลึง', category: 'veg', k: 220, p: 45, na: 25, protein: 3.2, kcal: 25, unit: '1 ถ้วย (100g)', tip: 'K ปานกลาง ต้มก่อนจะช่วยลด K' },
  { id: 14, name: 'แตงกวา', category: 'veg', k: 136, p: 21, na: 2, protein: 0.7, kcal: 12, unit: '1 ถ้วย (100g)', tip: 'K ปานกลาง กินสดได้ในปริมาณพอเหมาะ' },
  { id: 15, name: 'บวบเหลี่ยม', category: 'veg', k: 115, p: 29, na: 3, protein: 1.2, kcal: 17, unit: '1 ถ้วย (100g)', tip: 'K ต่ำ ผักที่ดีสำหรับคนไต' },
  { id: 16, name: 'ฟักทอง', category: 'veg', k: 340, p: 44, na: 1, protein: 1.0, kcal: 26, unit: '1 ถ้วย (100g)', tip: 'K สูงทั้งๆที่สีสวย ต้มทิ้งน้ำก่อน', warning: 'K สูง สีเหลืองสวยแต่ K ไม่สวย' },
  { id: 17, name: 'มะเขือเทศ', category: 'veg', k: 290, p: 24, na: 5, protein: 0.9, kcal: 18, unit: '1 ลูก (100g)', tip: 'K สูง สีแดงสดแต่ K ก็แดง', warning: 'K สูงลิ่ว' },
  { id: 18, name: 'ฟักเขียว', category: 'veg', k: 153, p: 19, na: 18, protein: 0.4, kcal: 13, unit: '1 ถ้วย (100g)', tip: 'K ปานกลาง ผักที่ค่อนข้างปลอดภัย' },
  { id: 19, name: 'ถั่วฝักยาว', category: 'veg', k: 240, p: 47, na: 4, protein: 2.9, kcal: 35, unit: '1 ถ้วย (100g)', tip: 'K ปานกลาง-สูง ลวกก่อน' },
  { id: 20, name: 'เห็ดหูหนู', category: 'veg', k: 70, p: 23, na: 9, protein: 0.5, kcal: 25, unit: '1 ถ้วย (100g)', tip: 'K ต่ำมาก เป็นผักที่ดีมากสำหรับคนไต' },
  { id: 21, name: 'ถั่วพู', category: 'veg', k: 130, p: 72, na: 2, protein: 4.5, kcal: 49, unit: '1 ถ้วย (100g)', tip: 'K ต่ำปานกลาง แต่ P สูงกว่าผักทั่วไป' },
  { id: 22, name: 'ผักชี', category: 'veg', k: 521, p: 48, na: 46, protein: 2.1, kcal: 23, unit: '100g', tip: 'K สูงมาก ใช้เป็นเครื่องประดับได้เล็กน้อย', warning: 'K สูงมาก ใช้เป็นเครื่องเคียงเล็กน้อยเท่านั้น' },
  { id: 23, name: 'หัวปลี', category: 'veg', k: 491, p: 55, na: 33, protein: 3.2, kcal: 68, unit: '100g', tip: 'K สูงมาก ลดปริมาณหรือต้มทิ้งน้ำหลายรอบ', warning: 'K สูงมาก' },
  { id: 24, name: 'มันฝรั่ง', category: 'veg', k: 425, p: 57, na: 6, protein: 2.0, kcal: 77, unit: '1 หัว (100g)', tip: 'K สูง ปอกเปลือก หั่นบาง แช่น้ำ ต้มทิ้งน้ำ จะช่วยลด K', warning: 'K สูง ต้องแช่น้ำ+ต้มทิ้งน้ำ' },

  // ผลไม้
  { id: 30, name: 'ชมพู่', category: 'fruit', k: 123, p: 8, na: 30, protein: 0.7, kcal: 32, unit: '2-3 ลูก (100g)', tip: 'ผลไม้เพื่อนไต K ต่ำ กินได้สบาย' },
  { id: 31, name: 'แอปเปิ้ล', category: 'fruit', k: 107, p: 11, na: 1, protein: 0.3, kcal: 52, unit: '1 ลูก (100g)', tip: 'K ต่ำ ผลไม้ที่ดีสำหรับคนไต ปอกเปลือกด้วย' },
  { id: 32, name: 'สับปะรด', category: 'fruit', k: 109, p: 8, na: 1, protein: 0.5, kcal: 50, unit: '4-5 ชิ้น (100g)', tip: 'K ต่ำ ผลไม้เพื่อนไต กินได้ในปริมาณพอเหมาะ' },
  { id: 33, name: 'แตงโม', category: 'fruit', k: 112, p: 11, na: 2, protein: 0.6, kcal: 30, unit: '2-3 ชิ้น (100g)', tip: 'K ต่ำ แต่มีน้ำมาก — HD ต้องนับน้ำด้วย' },
  { id: 34, name: 'เงาะ', category: 'fruit', k: 140, p: 9, na: 17, protein: 0.9, kcal: 60, unit: '5-6 ลูก (100g)', tip: 'K ปานกลาง กินพอเหมาะ' },
  { id: 35, name: 'ส้มโอ', category: 'fruit', k: 153, p: 17, na: 1, protein: 0.8, kcal: 38, unit: '2-3 กลีบ (100g)', tip: 'K ปานกลาง กินได้บ้างในปริมาณจำกัด' },
  { id: 36, name: 'มะม่วงสุก', category: 'fruit', k: 168, p: 11, na: 2, protein: 0.8, kcal: 60, unit: '1 ชิ้น (100g)', tip: 'K ปานกลาง ไม่เกิน 1-2 ชิ้น/วัน' },
  { id: 37, name: 'มะละกอสุก', category: 'fruit', k: 257, p: 10, na: 8, protein: 0.5, kcal: 43, unit: '3-4 ชิ้น (100g)', tip: 'K สูง จำกัดปริมาณ', warning: 'K สูงกว่าที่คิด' },
  { id: 38, name: 'ส้มเขียวหวาน', category: 'fruit', k: 181, p: 21, na: 2, protein: 0.9, kcal: 47, unit: '1 ลูก (100g)', tip: 'K ปานกลาง กินได้ 1-2 ลูก/วัน' },
  { id: 39, name: 'กล้วยน้ำว้าสุก', category: 'fruit', k: 422, p: 22, na: 1, protein: 1.1, kcal: 89, unit: '1 ลูก (100g)', tip: 'K สูงมาก กล้วย 1 ลูก = K เยอะกว่าแอปเปิ้ล 4 ลูก', warning: 'K สูงมาก — ระวัง!' },
  { id: 40, name: 'ลำไย', category: 'fruit', k: 266, p: 21, na: 1, protein: 1.3, kcal: 60, unit: '10 ลูก (100g)', tip: 'K สูง ดูน้อยแต่ K ไม่น้อย', warning: 'K สูง — จำกัดปริมาณ' },
  { id: 41, name: 'ทุเรียน', category: 'fruit', k: 436, p: 39, na: 2, protein: 3.6, kcal: 147, unit: '1-2 เม็ด (100g)', tip: 'ราชา K และพลังงาน — คนไต Stage C ขึ้นไปหลีกเลี่ยง', warning: 'K สูงมาก + แคลอรี่สูง — ราชาผลไม้ราชา K' },
  { id: 42, name: 'ฝรั่ง', category: 'fruit', k: 417, p: 40, na: 3, protein: 2.6, kcal: 68, unit: '1/2 ลูก (100g)', tip: 'K สูงกว่าที่คิด โดยเฉพาะแบบดิบ', warning: 'K สูงกว่าที่คิด' },
  { id: 43, name: 'น้ำมะพร้าว', category: 'fruit', k: 250, p: 20, na: 105, protein: 0.8, kcal: 19, unit: '1 ลูก (~240ml)', tip: 'K สูง 1 ลูกใหญ่ = K ระเบิด — HD หลีกเลี่ยง', warning: 'K สูง — K ระเบิดในแก้วเดียว' },

  // เนื้อสัตว์/โปรตีน
  { id: 50, name: 'ไข่ขาว', category: 'meat', k: 163, p: 15, na: 166, protein: 10.9, kcal: 52, unit: '2 ฟอง (100g)', tip: 'โปรตีนดีคุณภาพสูง P ต่ำ เพื่อนแท้คนไต' },
  { id: 51, name: 'ไข่ไก่ (ทั้งฟอง)', category: 'meat', k: 138, p: 198, na: 142, protein: 12.6, kcal: 155, unit: '2 ฟอง (100g)', tip: 'P สูงที่ไข่แดง กิน 1 ฟอง/วัน ถ้า P สูงใช้แต่ไข่ขาว' },
  { id: 52, name: 'อกไก่ต้ม', category: 'meat', k: 374, p: 220, na: 74, protein: 23.1, kcal: 116, unit: 'ฝ่ามือ (100g)', tip: 'โปรตีนคุณภาพดี K และ P สูงตามธรรมชาติของเนื้อสัตว์ กิน 1 ฝ่ามือ/มื้อ' },
  { id: 53, name: 'หมูสันใน', category: 'meat', k: 358, p: 197, na: 64, protein: 21.0, kcal: 143, unit: 'ฝ่ามือ (100g)', tip: 'โปรตีนดี P ไม่สูงเกิน เลือกส่วนไม่ติดมัน' },
  { id: 54, name: 'ปลากะพง', category: 'meat', k: 384, p: 228, na: 60, protein: 19.3, kcal: 90, unit: 'ฝ่ามือ (100g)', tip: 'ปลาดีกว่าหมู/ไก่ ต้มหรือนึ่งดีกว่าทอด' },
  { id: 55, name: 'ปลาทู', category: 'meat', k: 250, p: 230, na: 75, protein: 22.0, kcal: 113, unit: 'ตัวกลาง (100g)', tip: 'โปรตีนสูง P สูง กินพอเหมาะ' },
  { id: 56, name: 'เต้าหู้แข็ง', category: 'meat', k: 120, p: 97, na: 7, protein: 8.0, kcal: 76, unit: '1 ก้อน (100g)', tip: 'โปรตีนจากพืช P ต่ำกว่าเนื้อสัตว์ กินได้ในปริมาณพอเหมาะ' },
  { id: 57, name: 'ถั่วเหลือง (สุก)', category: 'meat', k: 515, p: 245, na: 1, protein: 16.6, kcal: 173, unit: '1/2 ถ้วย (100g)', tip: 'K และ P สูงมาก ถึงจะเป็นโปรตีนพืช', warning: 'K และ P สูงมาก' },

  // อาหารแปรรูป
  { id: 60, name: 'ลูกชิ้นหมู', category: 'processed', k: 100, p: 180, na: 850, protein: 12.0, kcal: 110, unit: '5 ลูก (100g)', tip: 'Na และ P สูงมาก มีสารเติมแต่งฟอสเฟต', warning: 'Na + P สูงมาก จากสารเติมแต่ง' },
  { id: 61, name: 'ไส้กรอก', category: 'processed', k: 155, p: 167, na: 860, protein: 11.0, kcal: 285, unit: '2 ชิ้น (100g)', tip: 'Na สูงมาก P จากสารเติมแต่ง ดูดซึม ~100%', warning: 'Na + P สูง — สารเติมแต่งฟอสเฟตดูดซึมหมด' },
  { id: 62, name: 'หมูยอ', category: 'processed', k: 150, p: 185, na: 900, protein: 14.0, kcal: 162, unit: '2-3 แผ่น (100g)', tip: 'Na และ P สูงมาก', warning: 'Na + P สูงมาก' },
  { id: 63, name: 'ปลากระป๋อง (น้ำเกลือ)', category: 'processed', k: 195, p: 320, na: 430, protein: 24.0, kcal: 90, unit: '1/2 กระป๋อง (100g)', tip: 'P สูงมาก Na สูง ล้างน้ำก่อนกินช่วยได้บ้าง', warning: 'P + Na สูงมาก' },
  { id: 64, name: 'บะหมี่กึ่งสำเร็จรูป', category: 'processed', k: 150, p: 120, na: 1800, protein: 8.0, kcal: 350, unit: '1 ซอง (85g)', tip: 'Na สูงอันดับแชมป์ 1 ซอง = Na เกินโควต้าทั้งวัน', warning: 'Na สูงสุดขีด! 1 ซอง = Na เกินทั้งวัน' },

  // เครื่องปรุง (ต่อ 1 ช้อนโต๊ะ ~15ml)
  { id: 70, name: 'น้ำปลา (1 ช้อนโต๊ะ)', category: 'seasoning', k: 42, p: 25, na: 1260, protein: 1.4, kcal: 6, unit: '1 ช้อนโต๊ะ (15ml)', tip: 'Na สูงมาก ใช้น้อยๆ หรือใช้มะนาวแทน', warning: 'Na สูงมาก — จิ้ม 1 ช้อน = เกลือครึ่งวัน' },
  { id: 71, name: 'ซีอิ๊วดำ (1 ช้อนโต๊ะ)', category: 'seasoning', k: 52, p: 27, na: 900, protein: 1.7, kcal: 12, unit: '1 ช้อนโต๊ะ (15ml)', tip: 'Na สูง', warning: 'Na สูง' },
  { id: 72, name: 'ซอสหอยนางรม (1 ช้อนโต๊ะ)', category: 'seasoning', k: 25, p: 15, na: 490, protein: 1.0, kcal: 18, unit: '1 ช้อนโต๊ะ (15ml)', tip: 'Na สูงปานกลาง ใช้ได้น้อยๆ' },
  { id: 73, name: 'น้ำปลาโลโซเดียม (1 ช้อนโต๊ะ)', category: 'seasoning', k: 900, p: 20, na: 400, protein: 1.0, kcal: 5, unit: '1 ช้อนโต๊ะ (15ml)', tip: 'กับดักร้ายแรง! ลด Na แต่ใช้ KCl แทน K สูงมาก', warning: 'อันตราย! K 900mg ต่อช้อน — กับดักคนไต' },
  { id: 74, name: 'ซีอิ๊วโลโซเดียม (1 ช้อนโต๊ะ)', category: 'seasoning', k: 700, p: 20, na: 350, protein: 1.5, kcal: 10, unit: '1 ช้อนโต๊ะ (15ml)', tip: 'กับดักร้ายแรง! K 700mg ซ่อนอยู่ในช้อนเดียว', warning: 'อันตราย! K 700mg ต่อช้อน — โลโซเดียม ≠ ปลอดภัย' },
  { id: 75, name: 'เกลือทดแทน (เกลือโพแทสเซียม)', category: 'seasoning', k: 3000, p: 5, na: 50, protein: 0, kcal: 0, unit: '1 ช้อนชา (5g)', tip: 'อันตรายมากที่สุด! = KCl บริสุทธิ์ ทำ K ขึ้นอันตราย', warning: 'อันตรายร้ายแรง! = โพแทสเซียมคลอไรด์บริสุทธิ์ ห้ามใช้!' },
  { id: 76, name: 'ผงชูรส (1 ช้อนชา)', category: 'seasoning', k: 5, p: 4, na: 492, protein: 0, kcal: 0, unit: '1 ช้อนชา (5g)', tip: 'Na สูง ผงชูรส = โซเดียมกลูตาเมต = Na', warning: 'Na สูง ชื่อก็บอกแล้วว่ามี โซเดียม' },
  { id: 77, name: 'ซุปก้อน (1 ก้อน)', category: 'seasoning', k: 30, p: 20, na: 900, protein: 1.5, kcal: 20, unit: '1 ก้อน (10g)', tip: 'Na สูงมาก 1 ก้อน = Na เกือบครึ่งวัน', warning: 'Na สูงมาก! 1 ก้อน = Na เกือบครึ่งวัน' },
  { id: 78, name: 'กะปิ (1 ช้อนชา)', category: 'seasoning', k: 80, p: 60, na: 1200, protein: 5.0, kcal: 40, unit: '1 ช้อนชา (5g)', tip: 'Na สูงมาก ใช้น้อยที่สุดหรือเลี่ยง', warning: 'Na สูงมาก' },

  // เครื่องดื่ม
  { id: 80, name: 'น้ำเปล่า', category: 'drink', k: 0, p: 0, na: 0, protein: 0, kcal: 0, unit: '1 แก้ว (240ml)', tip: 'ดีที่สุด! แต่ HD ต้องนับปริมาณ' },
  { id: 81, name: 'กาแฟดำ (ไม่ใส่นม)', category: 'drink', k: 116, p: 10, na: 5, protein: 0.3, kcal: 5, unit: '1 แก้ว (240ml)', tip: 'ดื่มได้ 1-2 แก้ว/วัน แต่ P สูงขึ้นถ้าใส่นม' },
  { id: 82, name: 'กาแฟลาเต้/นมสด', category: 'drink', k: 350, p: 222, na: 105, protein: 8.0, kcal: 122, unit: '1 แก้ว (240ml)', tip: 'P+K สูงจากนม กาแฟดำดีกว่า', warning: 'P + K สูงจากนม' },
  { id: 83, name: 'น้ำเต้าหู้จืด', category: 'drink', k: 290, p: 99, na: 9, protein: 7.0, kcal: 80, unit: '1 แก้ว (240ml)', tip: 'K ปานกลาง P สูงพอสมควร ดื่มได้บ้าง' },
  { id: 84, name: 'ชาเขียวขวด', category: 'drink', k: 40, p: 5, na: 50, protein: 0.1, kcal: 45, unit: '1 ขวด (480ml)', tip: 'Na แฝงในน้ำชา + น้ำตาลสูง ระวัง' },
  { id: 85, name: 'น้ำส้มคั้น', category: 'drink', k: 496, p: 42, na: 2, protein: 1.7, kcal: 112, unit: '1 แก้ว (240ml)', tip: 'K สูงมากในน้ำผลไม้ปั่น K เข้มข้น 3-4 เท่าของกินผลไม้สด', warning: 'K สูงมาก — น้ำผลไม้ = K เข้มข้น' },
  { id: 86, name: 'โคล่า/น้ำอัดลม', category: 'drink', k: 4, p: 32, na: 45, protein: 0, kcal: 42, unit: '1 กระป๋อง (330ml)', tip: 'P สูงจากกรดฟอสฟอริก + น้ำตาลสูง', warning: 'P จากกรดฟอสฟอริก ดูดซึม ~100%' },

  // อาหารเสริมที่ต้องระวัง
  { id: 90, name: 'คอลลาเจน (1 ซอง)', category: 'supplement', k: 20, p: 50, na: 30, protein: 10.0, kcal: 40, unit: '1 ซอง (10g)', tip: 'คอลลาเจน = โปรตีนแฝง บวกกับโปรตีนในมื้ออาหาร', warning: 'คอลลาเจน = โปรตีนแฝง — ต้องนับรวม' },
  { id: 91, name: 'วิตามินซีเม็ดฟู่ (1 เม็ด)', category: 'supplement', k: 0, p: 0, na: 350, protein: 0, kcal: 15, unit: '1 เม็ด', tip: 'ฟู่ได้เพราะ Na + อาจมี oxalate สูงทำให้นิ่ว', warning: 'Na สูง + oxalate — ไม่เหมาะสำหรับคนไต' },
  { id: 92, name: 'นมผง/โปรตีนเชค', category: 'supplement', k: 1600, p: 1000, na: 500, protein: 35.0, kcal: 400, unit: '100g ผง', tip: 'P+K+โปรตีน ครบสามเด้ง อันตรายสูงสำหรับคนไต', warning: 'P + K + โปรตีน ครบสามเด้ง — อันตราย!' },
]

// อาหารต้องห้ามอย่างเด็ดขาด
export const BANNED_FOODS = [
  {
    name: 'มะเฟือง',
    icon: '⭐',
    reason: 'Oxalate สูงมาก + K สูง',
    danger: 'ไตวายเฉียบพลันได้จาก 1 ชิ้น',
    level: 'absolute',
  },
  {
    name: 'ตะลิงปลิง',
    icon: '🍒',
    reason: 'Oxalate สูง + พิษต่อระบบประสาท',
    danger: 'ไตวายเฉียบพลัน',
    level: 'absolute',
  },
  {
    name: 'ลูกเนียง',
    icon: '🫘',
    reason: 'กรดเจ็งโคลิค (Djenkolic acid)',
    danger: 'ท่อไตอุดตัน อาการใน 2-14 ชม.',
    level: 'absolute',
  },
  {
    name: 'น้ำลูกยอ',
    icon: '🍵',
    reason: 'K สูงมากในรูปเข้มข้น',
    danger: 'K พุ่งสูงอันตรายต่อหัวใจ',
    level: 'absolute',
  },
  {
    name: 'ถั่งเช่า',
    icon: '🐛',
    reason: 'Cordycepin คล้าย NSAIDs + โลหะหนักปนเปื้อน',
    danger: 'สมาคมโรคไตไทยไม่สนับสนุน ไม่มีหลักฐาน',
    level: 'absolute',
  },
  {
    name: 'ไคร้เครือ/มูตอง',
    icon: '🌿',
    reason: 'Aristolochic acid',
    danger: 'ไตเรื้อรัง + มะเร็งทางเดินปัสสาวะ',
    level: 'absolute',
  },
  {
    name: 'ชะเอมเทศ',
    icon: '🌱',
    reason: 'ความดันสูง บวม',
    danger: 'ไตวายเฉียบพลัน',
    level: 'absolute',
  },
  {
    name: 'ยาล้างไต (methylene blue)',
    icon: '💊',
    reason: 'ถูกถอนทะเบียน ผิดกฎหมาย',
    danger: 'ไม่ได้ล้างไต ฉี่สีฟ้าแค่สีย้อม',
    level: 'absolute',
  },
]

export const CAUTION_HERBS = [
  { name: 'หญ้าหนวดแมว', reason: 'ขับปัสสาวะแรง → ไตทำงานหนัก' },
  { name: 'กระเจี๊ยบ', reason: 'ขับปัสสาวะแรง → ไตวายเฉียบพลัน' },
  { name: 'ว่านหางจระเข้', reason: 'ไม่มีหลักฐานในคนไต อาจมีพิษ' },
  { name: 'ฟ้าทะลายโจร', reason: 'อาจมีผลต่อไต ถามแพทย์ก่อน' },
  { name: 'ขมิ้นชัน', reason: 'ถามแพทย์ก่อน มี oxalate' },
  { name: 'กระชาย', reason: 'ถามแพทย์ก่อนกิน' },
  { name: 'เห็ดหลินจือ', reason: 'ไม่มีหลักฐาน อาจมีพิษต่อตับ' },
  { name: 'หญ้าหวาน', reason: 'ไม่มีหลักฐานที่ชัดเจน' },
]

// คำนวณระดับ K ต่อ 100g
export function getKLevel(k) {
  if (k < 100) return 'low'
  if (k <= 250) return 'medium'
  return 'high'
}

export function getPLevel(p) {
  if (p < 100) return 'low'
  if (p <= 200) return 'medium'
  return 'high'
}

export function getNaLevel(na) {
  if (na < 100) return 'low'
  if (na <= 300) return 'medium'
  return 'high'
}

// คำนวณความปลอดภัยของอาหารตาม profile
export function getFoodSafety(food, profile) {
  if (!profile || !profile.stage) return { level: 'unknown', issues: [] }

  const { stage, kStatus, onKMed, onPBinder, fluidRestrict, hasDiabetes, hasHypertension } = profile
  const issues = []

  // K thresholds per stage (mg/100g)
  const kThresholds = {
    A: kStatus === 'high' || onKMed ? 200 : 9999,
    B: kStatus === 'high' || onKMed ? 150 : 300,
    C: kStatus === 'high' || onKMed ? 100 : 200,
    D: 150,
    E: 150,
    F: 200,
  }

  // P thresholds per stage (mg/100g)
  const pThresholds = {
    A: 9999,
    B: 250,
    C: 200,
    D: 150,
    E: 200,
    F: 200,
  }

  const kT = kThresholds[stage] || 200
  const pT = pThresholds[stage] || 200

  // Na threshold — tighter if hypertension or heart disease
  const naT = hasHypertension ? 200 : 300

  if (food.k > kT * 1.5) issues.push({ type: 'K', severity: 'danger' })
  else if (food.k > kT) issues.push({ type: 'K', severity: 'caution' })

  if (food.p > pT * 1.5) issues.push({ type: 'P', severity: 'danger' })
  else if (food.p > pT) issues.push({ type: 'P', severity: 'caution' })

  if (food.na > naT * 2) issues.push({ type: 'Na', severity: 'danger' })
  else if (food.na > naT) issues.push({ type: 'Na', severity: 'caution' })

  // Fluid concern for HD
  if (stage === 'E' && fluidRestrict && food.category === 'drink' && food.id !== 80) {
    issues.push({ type: 'น้ำ', severity: 'caution' })
  }

  if (issues.some((i) => i.severity === 'danger')) return { level: 'danger', issues }
  if (issues.length > 0) return { level: 'caution', issues }
  return { level: 'safe', issues }
}
