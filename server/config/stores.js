/**
 * รายชื่อร้านในกลุ่มที่ดึงสินค้ามาวิเคราะห์ราคาข้ามร้าน
 *
 * เพิ่มเพื่อนใหม่ = เพิ่ม object ในอาร์เรย์นี้ไฟล์เดียว ไม่ต้องแตะที่อื่น
 *
 * ทุกร้านเขียน API กันคนละแบบ (บางร้านห่อด้วย {items} บางร้านคืน array ตรง ๆ,
 * ชื่อฟิลด์ id/name ไม่ตรงกัน, ราคาบางร้านเป็น string) — หน้าที่ของ map() คือ
 * แปลงสินค้า 1 รายการของร้านนั้นให้เป็นรูปแบบกลางที่โมดูลวิเคราะห์เข้าใจ:
 *
 *   { id, name, price, brand, category }   ← price ต้องเป็น number เท่านั้น
 *
 * คืน null = ข้ามรายการนั้น (เช่น ของที่ขายไปแล้ว) โมดูลจะกรองออกให้เอง
 */

/** ราคาบางร้านส่งมาเป็น string เช่น "4590.00" — ต้องแปลงก่อนเสมอ */
function toPrice(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

const STORES = [
  {
    id: 'chaje',
    name: 'Chaje Electric (ของเรา)',
    kind: 'เครื่องใช้ไฟฟ้า',
    url: 'http://119.59.102.161:3059/api/products?limit=100',
    map: (row) => ({
      id: String(row.id),
      name: row.name,
      price: toPrice(row.price),
      brand: row.brand ?? '',
      category: row.categoryId ?? '',
    }),
  },
  {
    id: 'shoes',
    name: 'ร้านรองเท้า',
    kind: 'รองเท้า',
    url: 'http://119.59.102.161:3049/api/products?limit=100',
    map: (row) => ({
      id: String(row.id),
      name: row.name,
      price: toPrice(row.price),
      brand: row.brand ?? '',
      category: row.category ?? '',
    }),
  },
  {
    id: 'storage',
    name: 'ร้านอุปกรณ์จัดเก็บข้อมูล',
    kind: 'SSD / ฮาร์ดดิสก์',
    url: 'http://119.59.102.161:3051/api/products?limit=100',
    // ร้านนี้ใช้ item_id / item_name ไม่ใช่ id / name
    map: (row) => ({
      id: String(row.item_id),
      name: row.item_name,
      price: toPrice(row.price),
      brand: row.brand ?? '',
      category: row.category ?? '',
    }),
  },
  {
    id: 'psu',
    name: 'ร้าน Power Supply',
    kind: 'อุปกรณ์คอมพิวเตอร์',
    url: 'http://119.59.102.161:3047/api/products?limit=100',
    map: (row) => ({
      id: String(row.psu_id),
      name: row.name,
      price: toPrice(row.price),
      brand: row.brand ?? '',
      category: row.efficiency_rating ?? '',
    }),
  },
  {
    id: 'cars',
    name: 'ร้านรถมือสอง',
    kind: 'รถยนต์มือสอง',
    url: 'http://119.59.102.161:3024/api/products?limit=100',
    map: (row) => {
      // รถที่ขายไปแล้วไม่ควรนำมาวิเคราะห์โปรโมชัน — ของที่ขายไม่ได้แล้วจัดโปรไม่ได้
      if (String(row.status).toLowerCase() === 'sold') return null;
      return {
        id: String(row.car_id ?? row.id),
        // ใช้ selling_price (ราคาขาย) ไม่ใช่ purchase_price (ราคาทุน)
        price: toPrice(row.selling_price ?? row.price),
        name: [row.brand, row.model, row.model_year].filter(Boolean).join(' ') || row.name,
        brand: row.brand ?? '',
        category: row.fuel_type ?? '',
      };
    },
  },
];

module.exports = { STORES };
