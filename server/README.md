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
ssh <user>@<host> -p <port>
```

จดข้อมูล 2 อย่างที่ระบบแจ้งตอน login ไว้ให้ดี:
- **พอร์ตที่อนุญาตให้เปิดบริการ** (บางเซิร์ฟเวอร์กำหนดมาให้เฉพาะพอร์ตเดียว พอร์ตอื่นถูกไฟร์วอลล์ปิด)
- **โฟลเดอร์ทำงาน** ที่ให้วางโค้ด (เช่น `/app`)

## ขั้นที่ 3 — อัปโหลดโค้ดขึ้นเซิร์ฟเวอร์

จากเครื่องคุณ (เปิด terminal ใหม่ ไม่ต้องปิด SSH):
```bash
cd MyProfileAppNindam
scp -P <port> -r server/* <user>@<host>:<โฟลเดอร์ทำงาน>/
```
(ไม่ต้องส่งโฟลเดอร์ `node_modules` — ไปติดตั้งบนเซิร์ฟเวอร์เอาเอง)

## ขั้นที่ 4 — ติดตั้ง dependency + ตั้งค่า .env

กลับไปที่ terminal ที่ SSH ค้างไว้:
```bash
cd <โฟลเดอร์ทำงาน>
npm install
cp .env.example .env
nano .env
```

กรอกในไฟล์ `.env`:
```ini
PORT=<พอร์ตที่เซิร์ฟเวอร์อนุญาต>
DB_HOST=localhost
DB_USER=<user ของ MySQL>
DB_PASSWORD=<รหัสผ่าน MySQL>
DB_NAME=<ชื่อ database>
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
curl http://<host>:<PORT>/api/health
# ต้องได้ {"ok":true}

curl http://<host>:<PORT>/api/products
# ต้องได้ JSON รายการสินค้า 12 ตัว

curl -X POST http://<host>:<PORT>/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@chaje.test","password":"user1234"}'
# ต้องได้ {"token":"...", "user":{...}}
```

## ขั้นที่ 6 — ทำให้รันค้างแม้ปิด SSH

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

ไม่มี hot reload! แก้โค้ดแล้วต้องอัปโหลดใหม่และรีสตาร์ต:
```bash
scp -P <port> -r server/routes <user>@<host>:<โฟลเดอร์ทำงาน>/
ssh <user>@<host> -p <port> "pm2 restart chaje-api"
```
(ถ้าใช้ nohup: SSH เข้าไป `pkill -f server.js` แล้วรัน `nohup node server.js ...` ใหม่)

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
