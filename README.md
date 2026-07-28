# Chaje Electric

แอปขายเครื่องใช้ไฟฟ้า สร้างด้วย **Expo (React Native) + TypeScript** ฝั่ง frontend และ
**Node.js + Express + MySQL** ฝั่ง backend

> 📄 ดูรายละเอียดสถานะงาน/ที่ทำไปแล้วทั้งหมดใน [`PROGRESS.md`](PROGRESS.md)
> ดูแผนงานที่เหลือใน [`Phase1.md`](Phase1.md)

---

## ฟีเจอร์ที่มีในแอป

- หน้าแรก: โปรโมชัน, หมวดหมู่สินค้า, สินค้าลดกระหน่ำ (พร้อมนับถอยหลัง), สินค้าแนะนำ
- ค้นหาสินค้า + ตัวกรองขั้นสูง (ยี่ห้อ, ช่วงราคา, เบอร์ประหยัดไฟ, สต๊อก)
- รายละเอียดสินค้า: แกลเลอรีรูป, สเปค, สต๊อกตามสาขา, แชร์สินค้า
- ระบบสมาชิก: สมัคร/เข้าสู่ระบบ (JWT), จำสถานะล็อกอินไว้ในเครื่อง
- ตะกร้าสินค้า + รายการโปรด (ซิงก์กับเซิร์ฟเวอร์ ไม่หายเมื่อรีเฟรช)
- Checkout ครบ flow: เลือก/เพิ่มที่อยู่จัดส่ง → สรุปคำสั่งซื้อ → ยืนยัน → หน้าสำเร็จ
- ประวัติคำสั่งซื้อ, คูปองส่วนลด, การแจ้งเตือน, หน้าตั้งค่า

---

## โครงสร้างโปรเจกต์

```
src/                  Frontend (Expo Router)
├── app/              หน้าจอทั้งหมด (ไฟล์ = route)
├── components/shop/  Component ใช้ซ้ำ (ProductCard, TopBar, ฯลฯ)
├── store/            React Context: auth, catalog (สินค้า), shop (ตะกร้า/โปรด)
├── api/              ฟังก์ชันเรียก REST API ของ backend
├── data/             ข้อมูลสินค้าสำรอง (ใช้ตอนต่อเน็ต/เซิร์ฟเวอร์ไม่ได้)
└── types/            TypeScript types

server/               Backend (Node + Express + MySQL)
├── server.js         จุดเริ่มโปรแกรม
├── routes/           REST endpoint แต่ละกลุ่ม (auth, products, cart, orders, ...)
├── sql/              schema.sql (สร้างตาราง) + seed.sql (ข้อมูลตั้งต้น)
└── README.md         วิธี deploy ฉบับเต็ม (สำหรับเซิร์ฟเวอร์ที่ใช้อยู่)
```

---

## วิธีรัน (Frontend)

### 1. ติดตั้ง dependencies

```bash
npm install
```

### 2. รันแอป

```bash
npx expo start --web      # เปิดในเบราว์เซอร์ (แนะนำ — ทดสอบง่ายที่สุด)
```

หรือ

```bash
npx expo start
```

แล้วเลือกวิธีเปิดจากเมนูใน terminal:

| กด | เปิดที่ |
|----|--------|
| `w` | เว็บเบราว์เซอร์ |
| `a` | Android emulator |
| `i` | iOS simulator (เฉพาะ Mac) |
| สแกน QR | มือถือจริงผ่านแอป **Expo Go** |

**ดูเป็นมือถือบนเว็บ:** กด `F12` เปิด DevTools → `Ctrl+Shift+M` → เลือกรุ่นมือถือ

**ถ้าแก้โค้ดแล้วแอปไม่อัปเดต / เจอ error แปลกๆ:**
```bash
npx expo start --web -c   # ล้าง cache
```

### 3. ตรวจ type ก่อนส่งงาน

```bash
npx tsc --noEmit
```
ต้องได้ผลลัพธ์ว่างเปล่า (0 error)

---

## วิธีรัน (Backend)

Backend ต้องรันอยู่ก่อนแอปถึงจะใช้งานได้จริง (ล็อกอิน, ตะกร้า, สั่งซื้อ ฯลฯ) — ไม่มี backend
แอปจะยังเปิดดูสินค้าได้ (ใช้ข้อมูลสำรองใน `src/data/`) แต่ระบบสมาชิกและตะกร้าจะใช้ไม่ได้

รายละเอียดวิธี deploy แบบเต็ม (SSH เข้าเซิร์ฟเวอร์, ตั้งค่า `.env`, ทดสอบด้วย curl, ฯลฯ)
อยู่ใน **[`server/README.md`](server/README.md)**

สรุปสั้นๆ:
1. รัน `server/sql/schema.sql` แล้ว `server/sql/seed.sql` ใน phpMyAdmin (สร้างตาราง + ใส่ข้อมูลตั้งต้น)
2. เข้าเซิร์ฟเวอร์ผ่าน SSH ไปที่โฟลเดอร์ backend
3. ตั้งค่าไฟล์ `.env` (ดู `server/.env.example`)
4. `npm install && node server.js`

ที่อยู่ของ backend ที่แอปเรียกใช้ ตั้งอยู่ใน [`src/config.ts`](src/config.ts) → `API_BASE_URL`

---

## ทดสอบการทำงาน (end-to-end)

หลังเปิดทั้ง backend และ frontend แล้ว ลองเดินตามนี้:

1. สมัครสมาชิก → เข้าสู่ระบบ → เห็นชื่อตัวเองในหน้าโปรไฟล์
2. ค้นหาสินค้า → เปิดตัวกรอง เลือกยี่ห้อ/ราคา → ผลลัพธ์เปลี่ยนถูกต้อง
3. กดหัวใจสินค้า → รีเฟรชหน้า → หัวใจต้องยังติดอยู่ (พิสูจน์ว่าซิงก์กับเซิร์ฟเวอร์จริง)
4. เพิ่มสินค้าลงตะกร้า → ชำระเงิน → เลือกที่อยู่ (หรือเพิ่มใหม่) → ยืนยันคำสั่งซื้อ
5. เข้าโปรไฟล์ → คำสั่งซื้อของฉัน → เห็นคำสั่งซื้อที่เพิ่งทำ
6. กดกระดิ่งแจ้งเตือน → เห็นแจ้งเตือน "สั่งซื้อสำเร็จ"

---

## เทคโนโลยีที่ใช้

**Frontend:** Expo SDK 57 · Expo Router · TypeScript · React Native Reanimated ·
lucide-react-native (ไอคอน) · expo-secure-store (เก็บ token)

**Backend:** Node.js · Express · MySQL (mysql2) · JWT (jsonwebtoken) · bcrypt

## เอกสารเพิ่มเติมในโปรเจกต์

| ไฟล์ | เนื้อหา |
|------|--------|
| [`AGENTS.md`](AGENTS.md) | กฎการทำงาน + ข้อมูลเซิร์ฟเวอร์ (สำหรับ AI/นักพัฒนา) |
| [`PROGRESS.md`](PROGRESS.md) | บันทึกความคืบหน้าของโปรเจกต์ |
| [`Phase1.md`](Phase1.md) | แผนงานที่เหลือ (production hardening) |
| [`server/README.md`](server/README.md) | วิธี deploy backend แบบละเอียด |
