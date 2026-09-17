# Chaje Electric API — วิธี deploy ขึ้นเซิร์ฟเวอร์

คู่มือนี้สำหรับนำ backend ขึ้นรันบนเซิร์ฟเวอร์จริง
(ถ้าแค่อยากรันบนเครื่องตัวเอง ดู [README หลัก](../README.md) หัวข้อ "วิธีติดตั้งและรัน" ก็พอ)

## ขั้นที่ 1 — เตรียม Database

เปิด phpMyAdmin ของเซิร์ฟเวอร์ → เลือก database ของคุณ
→ แท็บ **Import** → เลือกไฟล์ `sql/schema.sql` → Go
→ แท็บ **Import** อีกครั้ง → เลือกไฟล์ `sql/seed.sql` → Go

ตรวจผล (แท็บ SQL):
```sql
SELECT COUNT(*) FROM products;  -- ต้องได้ 12
SHOW TABLES;                    -- ต้องเห็น 12 ตาราง
```

## ขั้นที่ 2 — เข้าเซิร์ฟเวอร์ผ่าน SSH

```bash
ssh std6730202645@119.59.102.161 -p 2222
```

ค่าที่ใช้จริงของโปรเจกต์นี้ — เติมไว้ในทุกคำสั่งด้านล่างแล้ว ไม่ต้องแทนที่เอง:

| รายการ | ค่า |
|---|---|
| SSH user | `std6730202645` |
| Host | `119.59.102.161` |
| SSH port | `2222` |
| โฟลเดอร์ทำงานบนเซิร์ฟเวอร์ | `/app` |
| พอร์ตที่เปิดบริการได้ | `3059` (พอร์ตอื่นถูกไฟร์วอลล์ปิด) |
| ชื่อ database | `ip_std6730202645` |

> ค่า `DB_USER` / `DB_PASSWORD` / `JWT_SECRET` ดูจากไฟล์ `server/.env` บนเครื่องตัวเอง


## ขั้นที่ 3 — อัปโหลดโค้ดขึ้นเซิร์ฟเวอร์

จากเครื่องคุณ (เปิด terminal ใหม่ ไม่ต้องปิด SSH):
```bash
cd MyProfileAppNindam
scp -P 2222 -r server/* std6730202645@119.59.102.161:/app/
```
(ไม่ต้องส่งโฟลเดอร์ `node_modules` — ไปติดตั้งบนเซิร์ฟเวอร์เอาเอง)

## ขั้นที่ 4 — ติดตั้ง dependency + ตั้งค่า .env

กลับไปที่ terminal ที่ SSH ค้างไว้:
```bash
cd /app
npm install
cp .env.example .env
nano .env
```

กรอกในไฟล์ `.env`:
```ini
PORT=3059
DB_HOST=localhost
DB_USER=<user ของ MySQL>
DB_PASSWORD=<รหัสผ่าน MySQL>
DB_NAME=ip_std6730202645
JWT_SECRET=<ค่าสุ่ม — สร้างด้วย: openssl rand -hex 32>
JWT_EXPIRES=7d
```
กด `Ctrl+O` แล้ว Enter (บันทึก), `Ctrl+X` (ออก)

> ⚠️ `.env` ถูก gitignore ไว้แล้ว **ห้าม commit ขึ้น GitHub เด็ดขาด**

## ขั้นที่ 5 — รันทดสอบ

```bash
node server.js
```
ควรเห็น: `✅ Chaje Electric API running on port XXXX`

**เปิด terminal ใหม่ในเครื่องคุณ** (อย่าปิดอันที่รันอยู่) แล้วทดสอบ:
```bash
curl http://119.59.102.161:3059/api/health
# ต้องได้ {"ok":true}

curl http://119.59.102.161:3059/api/products
# ต้องได้ JSON รายการสินค้า 12 ตัว

curl -X POST http://119.59.102.161:3059/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@chaje.test","password":"user1234"}'
# ต้องได้ {"token":"...", "user":{...}}
```

## ขั้นที่ 6 — ทำให้รันค้างแม้ปิด SSH

> **สถานะปัจจุบัน: ยังไม่ได้ตั้ง pm2 บนเซิร์ฟเวอร์** ตอนนี้รันด้วย `node server.js` ค้าง terminal ไว้
> ปิด SSH เมื่อไหร่ API ดับทันที — ถ้าจะพรีเซนต์ ห้ามปิดหน้าต่างนั้น

กลับไปที่ terminal ที่รัน `node server.js` อยู่ กด `Ctrl+C` หยุดก่อน แล้ว:

```bash
npm install -g pm2   # ถ้าไม่มีสิทธิ์ติดตั้ง global ให้ข้ามไปใช้วิธี nohup ด้านล่างแทน
pm2 start server.js --name chaje-api
pm2 save
```

**ถ้าไม่มีสิทธิ์ลง pm2** ใช้วิธีนี้แทน:
```bash
nohup node server.js > out.log 2>&1 &
disown
```

ตอนนี้ปิด SSH ได้แล้ว API จะยังรันอยู่

## หลังแก้โค้ด — ต้องทำใหม่ทุกครั้ง

ไม่มี hot reload! แก้โค้ดแล้วต้องอัปโหลดใหม่และรีสตาร์ตเสมอ

**ต้องส่งทุกโฟลเดอร์ที่แก้ อย่าส่งแค่ `routes`** — `routes/analytics.js` เรียก `require('../ml/...')`
ถ้าส่ง `routes` ขึ้นไปโดยไม่มี `ml` เซิร์ฟเวอร์จะขึ้น `Cannot find module` แล้วดับตอนบูตทันที

```bash
cd MyProfileAppNindam
scp -P 2222 -r server/ml server/routes server/middleware server/server.js \
  std6730202645@119.59.102.161:/app/
```

แล้วรีสตาร์ต — ตอนนี้ยังไม่มี pm2 จึงทำแบบนี้:
```bash
ssh std6730202645@119.59.102.161 -p 2222
cd /app
pkill -f server.js     # หยุดตัวเก่า (ถ้ายังรันค้างอยู่)
node server.js         # ทิ้ง terminal นี้ไว้ ห้ามปิด
```

ถ้าวันหลังตั้ง pm2 แล้ว: `ssh std6730202645@119.59.102.161 -p 2222 "pm2 restart chaje-api"`

**เช็คว่าขึ้นจริง (เปิดอีก terminal ในเครื่องตัวเอง):**
```bash
curl http://119.59.102.161:3059/api/health
# ต้องได้ {"ok":true}

curl http://119.59.102.161:3059/api/analytics/product-clusters
# ต้องได้ 401 {"message":"ไม่ได้เข้าสู่ระบบ"} = route วิเคราะห์ขึ้นแล้ว
```

## จุดที่พลาดบ่อย

| อาการ | สาเหตุที่เป็นไปได้ |
|-------|-------------------|
| `curl` ไม่ตอบเลย | server ไม่ได้รัน (`pm2 list` เช็ค) หรือ listen ผิดพอร์ต |
| `curl` timeout | ลืม `listen(PORT, '0.0.0.0')` — เช็คใน `server.js` (ถ้า listen แค่ `127.0.0.1` เครื่องภายนอกเรียกไม่ถึง) |
| ภาษาไทยเป็น `???` | `db.js` ไม่ได้ตั้ง `charset: 'utf8mb4_unicode_ci'` หรือ database ไม่ใช่ utf8mb4 |
| Access-Control error บนเว็บ | ลืม `app.use(cors())` ใน `server.js` |
| `#1142 ... command denied` ตอนรัน SQL | user ของ DB สิทธิ์ไม่พอ — schema ชุดนี้เลี่ยง `FOREIGN KEY` และ `TRUNCATE` ไว้ให้แล้ว |
| 401 ทุก endpoint ที่ควรใช้ได้แม้ไม่ล็อกอิน | เผลอใส่ route ไว้หลัง `router.use(auth)` |
| อัปโหลดรูปไม่ได้ | โฟลเดอร์ `uploads/` เขียนไม่ได้ (`server.js` สร้างให้อัตโนมัติตอนบูต) |

## โครงสร้างไฟล์

```
server/
├── server.js           entrypoint — ต่อ route ทั้งหมด
├── db.js               mysql2 connection pool
├── package.json
├── .env.example        คัดลอกเป็น .env แล้วใส่ค่าจริง (.env ห้าม commit)
├── middleware/
│   ├── auth.js         ตรวจ JWT
│   ├── admin.js        เช็คสิทธิ์แอดมิน (อ่าน is_admin สดจาก DB)
│   └── error.js        error handler กลาง + asyncHandler
├── routes/
│   ├── auth.js         register, login, me
│   ├── products.js     list (filter/search/sort/page), detail, brands, CRUD แอดมิน
│   ├── categories.js
│   ├── cart.js
│   ├── favorites.js
│   ├── addresses.js
│   ├── orders.js       มี transaction ตอนสร้าง order
│   ├── notifications.js
│   ├── coupons.js
│   ├── users.js        PATCH settings
│   └── uploads.js      อัปโหลดรูปสินค้า (เฉพาะแอดมิน)
├── uploads/            รูปที่อัปโหลด (สร้างอัตโนมัติตอนรัน — ไม่ commit ไฟล์รูป)
└── sql/
    ├── schema.sql      รันก่อน (สร้างตาราง 12 ตาราง)
    └── seed.sql        รันทีหลัง (ข้อมูลตั้งต้น + บัญชีทดสอบ)
```
