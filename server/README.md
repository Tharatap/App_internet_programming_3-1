# Chaje Electric API — วิธี deploy บนเซิร์ฟเวอร์อาจารย์

โค้ดชุดนี้พร้อมใช้แล้ว ทำตามขั้นตอนนี้ทีละข้อ

## ขั้นที่ 1 — เตรียม Database (ทำก่อน ถ้ายังไม่ทำ)

phpMyAdmin → http://119.59.102.161/nindamdb → เลือก DB `ip_std6730202645`
→ แท็บ **Import** → เลือกไฟล์ `sql/schema.sql` → Go
→ แท็บ **Import** อีกครั้ง → เลือกไฟล์ `sql/seed.sql` → Go

ตรวจผล (แท็บ SQL):
```sql
SELECT COUNT(*) FROM products;  -- ต้องได้ 12
```

## ขั้นที่ 2 — SSH เข้าเซิร์ฟเวอร์

```bash
ssh std6730202645@119.59.102.161 -p 2222
test2 บัญชีนี้รหัส 11111111 เป็น admin
```
ใส่รหัสผ่าน (ดูที่ http://nindam.ddns.net/web/) → **จดตัวเลข Assigned backend port ที่ระบบแจ้ง**
(ต้องใช้ port นี้เท่านั้น — port อื่นถูกไฟร์วอลล์ปิด)

```bash
cd /app
```

## ขั้นที่ 3 — อัปโหลดโค้ดขึ้น `/app`

จากเครื่องคุณ (เปิด terminal ใหม่ ไม่ต้องปิด SSH):
```bash
cd "e:\visual studio\Internet_programming\MyProfileAppNindam"
scp -P 2222 -r server/* std6730202645@119.59.102.161:/app/
```
(ไม่ต้องส่งโฟลเดอร์ `node_modules` ถ้ามี — ยังไม่ได้สร้างตอนนี้อยู่แล้ว)

## ขั้นที่ 4 — ติดตั้ง dependency + ตั้งค่า .env

กลับไปที่ terminal ที่ SSH ค้างไว้:
```bash
cd /app
npm install
cp .env.example .env
nano .env
```
กรอกในไฟล์ `.env`:
```
PORT=<Assigned backend port ที่จดไว้>
DB_PASSWORD=<รหัสผ่าน MySQL จาก nindam.ddns.net/web/>
JWT_SECRET=<สุ่มค่ายาวๆ เช่น รันคำสั่ง: openssl rand -hex 32>
```
กด `Ctrl+O` แล้ว Enter (บันทึก), `Ctrl+X` (ออก)

## ขั้นที่ 5 — รันทดสอบ

```bash
node server.js
```
ควรเห็น: `✅ Chaje Electric API running on port XXXX`

**เปิด terminal ใหม่ในเครื่องคุณ** (อย่าปิดอันที่รันอยู่) ทดสอบ:
```bash
curl http://119.59.102.161:<PORT>/api/health
# ต้องได้ {"ok":true}

curl http://119.59.102.161:<PORT>/api/products
# ต้องได้ JSON รายการสินค้า 12 ตัว

curl -X POST http://119.59.102.161:<PORT>/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"12345678","name":"Test"}'
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

ไม่มี hot reload! แก้โค้ดแล้วต้อง:
```bash
scp -P 2222 -r server/routes std6730202645@119.59.102.161:/app/
ssh std6730202645@119.59.102.161 -p 2222 "pm2 restart chaje-api"
```
(หรือถ้าใช้ nohup: SSH เข้าไป `pkill -f server.js` แล้วรัน `nohup node server.js ...` ใหม่)

## จุดที่พลาดบ่อย

| อาการ | สาเหตุที่เป็นไปได้ |
|-------|-------------------|
| `curl` ไม่ตอบเลย | server ไม่ได้รัน (`pm2 list` เช็ค) หรือ listen ผิด port |
| `curl` timeout | ลืม `listen(PORT, '0.0.0.0')` — เช็คใน `server.js` |
| ภาษาไทยเป็น `???` | `db.js` ไม่ได้ตั้ง `charset: 'utf8mb4_unicode_ci'` |
| Access-Control error บนเว็บ | ลืม `app.use(cors())` ใน `server.js` |
| 401 ทุก endpoint ที่ควรใช้ได้แม้ไม่ล็อกอิน | เผลอใส่ route หลัง `router.use(auth)` |

## โครงสร้างไฟล์

```
server/
├── server.js           entrypoint — ต่อ route ทั้งหมด
├── db.js               mysql2 connection pool
├── package.json
├── .env.example         คัดลอกเป็น .env แล้วใส่ค่าจริง (.env ห้าม commit)
├── middleware/
│   ├── auth.js          ตรวจ JWT
│   └── error.js         error handler กลาง + asyncHandler
├── routes/
│   ├── auth.js          register, login, me
│   ├── products.js      list (filter/search/sort/page), detail, brands
│   ├── categories.js
│   ├── cart.js
│   ├── favorites.js
│   ├── addresses.js
│   ├── orders.js        มี transaction ตอนสร้าง order
│   ├── notifications.js
│   ├── coupons.js
│   └── users.js         PATCH settings
└── sql/
    ├── schema.sql       รันก่อน (สร้างตาราง)
    └── seed.sql         รันทีหลัง (ใส่ข้อมูล 12 สินค้า)
```
