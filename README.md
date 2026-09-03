# Chaje Electric

แอปขายเครื่องใช้ไฟฟ้า สร้างด้วย **Expo (React Native) + TypeScript** ฝั่ง frontend และ
**Node.js + Express + MySQL** ฝั่ง backend

---

## ฟีเจอร์ที่มีในแอป

- หน้าแรก: โปรโมชัน, หมวดหมู่สินค้า, สินค้าลดกระหน่ำ (พร้อมนับถอยหลัง), สินค้าแนะนำ
- ค้นหาสินค้า + ตัวกรองขั้นสูง (ยี่ห้อ, ช่วงราคา, เบอร์ประหยัดไฟ, สต๊อก)
- รายละเอียดสินค้า: แกลเลอรีรูป, สเปค, สต๊อกตามสาขา, แชร์สินค้า
- ระบบสมาชิก: สมัคร/เข้าสู่ระบบ (JWT), จำสถานะล็อกอินไว้ในเครื่อง
- ตะกร้าสินค้า + รายการโปรด (ซิงก์กับเซิร์ฟเวอร์ ไม่หายเมื่อรีเฟรช)
- Checkout ครบ flow: เลือก/เพิ่มที่อยู่จัดส่ง → สรุปคำสั่งซื้อ → ยืนยัน → หน้าสำเร็จ
- ประวัติคำสั่งซื้อ, คูปองส่วนลด, การแจ้งเตือน, หน้าตั้งค่า
- โหมดแอดมิน: เพิ่ม / แก้ไข / ลบสินค้า + อัปโหลดรูปสินค้า

---

## Architecture

ระบบแบ่งเป็น 3 ชั้นแยกกันชัดเจน คุยกันผ่าน **REST API + JSON** เท่านั้น

```
┌────────────────────────────────────────────────────────────────┐
│  CLIENT — Expo App (iOS / Android / Web)                       │
│                                                                │
│   src/app/          หน้าจอ (Expo Router: 1 ไฟล์ = 1 route)      │
│         ↓ อ่าน/สั่งงานผ่าน                                      │
│   src/store/        React Context: auth · catalog · shop · theme│
│         ↓ เรียก                                                 │
│   src/api/          ฟังก์ชันต่อ endpoint (auth.ts, cart.ts, …)  │
│         ↓ ทุกตัวยิงผ่านจุดเดียว                                  │
│   src/api/client.ts ← ต่อ base URL + แนบ JWT + แปลง error       │
└────────────────────────────┬───────────────────────────────────┘
                             │  HTTP  (Authorization: Bearer <JWT>)
                             ▼
┌────────────────────────────────────────────────────────────────┐
│  SERVER — Node.js + Express  (server/)                         │
│                                                                │
│   server.js        ประกอบ middleware + ผูก route ทั้งหมด         │
│         ↓                                                       │
│   middleware/      auth.js (ตรวจ JWT) · admin.js (เช็ค is_admin)│
│                    error.js (asyncHandler + error handler กลาง) │
│         ↓                                                       │
│   routes/*.js      business logic + SQL (prepared statement)    │
│         ↓                                                       │
│   db.js            mysql2 connection pool (utf8mb4)             │
└────────────────────────────┬───────────────────────────────────┘
                             │  SQL
                             ▼
┌────────────────────────────────────────────────────────────────┐
│  DATABASE — MySQL 8  (12 ตาราง — server/sql/schema.sql)         │
│                                                                │
│   users · categories · products · product_images ·             │
│   product_branch_stock · addresses · cart_items · favorites ·   │
│   orders · order_items · notifications · coupons                │
└────────────────────────────────────────────────────────────────┘
```

### ความสัมพันธ์ของตาราง

```
users ─┬─< addresses            (ที่อยู่จัดส่งของผู้ใช้)
       ├─< cart_items >─ products
       ├─< favorites  >─ products
       ├─< notifications
       └─< orders ─< order_items   (order_items = snapshot ไม่ผูกกับ products)

categories ─< products ─┬─< product_images
                        └─< product_branch_stock

coupons                 (แยกอิสระ — orders เก็บแค่ coupon_code เป็น snapshot)
```

### หลักการออกแบบที่ใช้

| เรื่อง | วิธีที่เลือก | เหตุผล |
|-------|------------|-------|
| **Auth** | JWT (`jsonwebtoken`) เก็บ token ที่เครื่องด้วย `expo-secure-store` | ไม่ต้องเก็บ session ฝั่ง server — scale ง่าย และบนมือถือใช้ cookie ไม่สะดวก |
| **รหัสผ่าน** | `bcrypt` cost 10 เก็บเฉพาะ hash | ห้ามเก็บรหัสดิบเด็ดขาด |
| **สิทธิ์แอดมิน** | `middleware/admin.js` อ่าน `is_admin` สดจาก DB ทุก request | ถ้าฝังไว้ใน JWT แล้วถอนสิทธิ์ทีหลัง token เดิมจะยังใช้ได้อยู่ |
| **SQL Injection** | ใช้ `?` placeholder (prepared statement) ทุกจุด ไม่ต่อ string เอง | ค่าจากผู้ใช้ไม่มีทางกลายเป็นคำสั่ง SQL |
| **เก็บเงิน** | คอลัมน์เป็น `DECIMAL(10,2)` ไม่ใช่ `FLOAT` | `FLOAT` ปัดเศษเพี้ยน |
| **ประวัติคำสั่งซื้อ** | `order_items` เก็บ snapshot ชื่อ/ราคา/รูป ณ ตอนสั่ง | ราคาสินค้าเปลี่ยนทีหลังต้องไม่กระทบใบสั่งซื้อเก่า |
| **สร้างคำสั่งซื้อ** | ครอบด้วย transaction (`beginTransaction` / `rollback`) | order + order_items + ล้างตะกร้า ต้องสำเร็จหรือล้มทั้งชุด |
| **ค้นหาภาษาไทย** | ใช้ `LIKE '%คำค้น%'` ไม่ใช้ `FULLTEXT` | ภาษาไทยไม่มีช่องว่างระหว่างคำ MySQL ตัดคำไม่ถูก |
| **ไม่มี FOREIGN KEY** | คุมความสัมพันธ์ที่โค้ด Express แทน (แต่ใส่ INDEX ครบ) | user ของ DB บนเซิร์ฟเวอร์เรียนไม่มีสิทธิ์ `REFERENCES` (error #1142) |
| **ภาษาไทยไม่เป็น `???`** | `utf8mb4` ทั้งฝั่ง DB และ `charset` ใน `db.js` | ขาดอย่างใดอย่างหนึ่งตัวอักษรจะเพี้ยน |
| **ออฟไลน์** | ถ้าต่อ API ไม่ได้ แอป fallback ไปใช้ JSON ใน `src/data/` | ยังเปิดดูสินค้าได้แม้ backend ล่ม |

---

## โครงสร้างโปรเจกต์

```
MyProfileAppNindam/
├── src/                       Frontend (Expo Router)
│   ├── app/                   หน้าจอทั้งหมด — ไฟล์ = route
│   │   ├── (auth)/            welcome, login, register
│   │   ├── (tabs)/            index (หน้าแรก), catalog, cart, favorites, profile
│   │   ├── product/[id].tsx   รายละเอียดสินค้า
│   │   ├── checkout/          address → summary → success
│   │   ├── orders/            รายการ + รายละเอียดคำสั่งซื้อ
│   │   ├── admin/             จัดการสินค้า (เฉพาะแอดมิน)
│   │   └── _layout.tsx        root layout — ครอบ Provider ทั้งหมด
│   ├── components/shop/       Component ใช้ซ้ำ (ProductCard, TopBar, Toast, …)
│   ├── store/                 React Context: auth · catalog · shop · theme
│   ├── api/                   ฟังก์ชันเรียก REST API (client.ts = ตัวยิงกลาง)
│   ├── hooks/ utils/ types/   hook, ฟังก์ชันช่วย, TypeScript types
│   ├── data/                  ข้อมูลสำรอง ใช้เมื่อเรียก API ไม่ได้
│   └── config.ts              ⚙️ API_BASE_URL — ต้องแก้ให้ตรงเครื่องคุณ
│
├── server/                    Backend (Node + Express + MySQL)
│   ├── server.js              entrypoint — ผูก route ทั้งหมด
│   ├── db.js                  mysql2 connection pool
│   ├── middleware/            auth.js · admin.js · error.js
│   ├── routes/                auth, products, categories, cart, favorites,
│   │                          addresses, orders, notifications, coupons,
│   │                          users, uploads
│   ├── sql/
│   │   ├── schema.sql         🗄️ สร้างตาราง 12 ตาราง (รันก่อน)
│   │   └── seed.sql           🌱 ข้อมูลตั้งต้น (รันทีหลัง)
│   ├── uploads/               รูปที่แอดมินอัปโหลด (สร้างอัตโนมัติตอนรัน)
│   ├── .env.example           คัดลอกเป็น .env แล้วใส่ค่าจริง
│   └── README.md              วิธี deploy ขึ้นเซิร์ฟเวอร์แบบละเอียด
│
├── assets/                    รูป ไอคอน ฟอนต์
└── package.json               dependency ฝั่ง frontend
```

### REST API endpoint หลัก

| Method + Path | ต้องล็อกอิน | ทำอะไร |
|---------------|:---------:|--------|
| `GET /api/health` | – | เช็คว่า server ตื่นอยู่ |
| `POST /api/auth/register` · `login` | – | สมัคร / เข้าสู่ระบบ → ได้ JWT |
| `GET /api/auth/me` | ✅ | ข้อมูลผู้ใช้ปัจจุบัน |
| `GET /api/products` | – | รายการสินค้า + ค้นหา/กรอง/เรียง/แบ่งหน้า |
| `GET /api/products/:id` · `/brands` | – | รายละเอียดสินค้า · รายชื่อยี่ห้อ |
| `POST /api/products` · `PUT` · `DELETE /api/products/:id` | 👑 แอดมิน | เพิ่ม / แก้ไข / ลบสินค้า |
| `GET /api/categories` | – | หมวดหมู่ทั้งหมด |
| `GET /api/cart` · `POST /items` · `PATCH /items/:productId` · `DELETE /items/:productId` · `PATCH /select-all` | ✅ | ตะกร้าสินค้า |
| `GET /api/favorites` · `POST /api/favorites/:productId` | ✅ | รายการโปรด (POST = สลับเพิ่ม/เอาออก) |
| `GET` · `POST /api/addresses` · `PATCH` · `DELETE /api/addresses/:id` | ✅ | ที่อยู่จัดส่ง |
| `POST /api/orders` · `GET /api/orders` · `GET /api/orders/:id` | ✅ | สร้าง / ประวัติ / รายละเอียดคำสั่งซื้อ |
| `GET /api/notifications` · `PATCH /api/notifications/:id/read` | ✅ | การแจ้งเตือน |
| `GET /api/coupons` | ✅ | คูปองที่ยังใช้ได้ |
| `PATCH /api/users/me/settings` | ✅ | ตั้งค่าภาษา/ธีม/แจ้งเตือน |
| `POST /api/uploads` | 👑 แอดมิน | อัปโหลดรูปสินค้า |

---

## Package ที่ต้องติดตั้ง

### ต้องมีในเครื่องก่อน

| โปรแกรม | เวอร์ชัน | ใช้ทำอะไร |
|--------|---------|----------|
| **Node.js** | 20 ขึ้นไป (LTS) | รันทั้ง frontend และ backend |
| **npm** | ติดมากับ Node | ติดตั้ง package |
| **MySQL** | 8.0 ขึ้นไป (หรือ XAMPP / MariaDB 10.4+) | ฐานข้อมูล |
| **Expo Go** | (ทางเลือก) แอปบนมือถือ | ทดสอบบนมือถือจริง |

### Backend — ติดตั้งด้วย `npm install` ในโฟลเดอร์ `server/`

| Package | ใช้ทำอะไร |
|---------|----------|
| `express` | web framework — สร้าง REST API |
| `mysql2` | ต่อ MySQL (connection pool + prepared statement) |
| `jsonwebtoken` | ออก/ตรวจ JWT ตอนล็อกอิน |
| `bcrypt` | เข้ารหัสรหัสผ่าน |
| `cors` | อนุญาตให้ Expo web เรียกข้ามโดเมน |
| `dotenv` | อ่านค่าจากไฟล์ `.env` |

### Frontend — ติดตั้งด้วย `npm install` ที่โฟลเดอร์หลัก

| Package | ใช้ทำอะไร |
|---------|----------|
| `expo` (SDK 57) + `expo-router` | ตัวแอป + ระบบ route แบบไฟล์ |
| `react-native` / `react-native-web` | รันได้ทั้งมือถือและเว็บจากโค้ดชุดเดียว |
| `react-native-reanimated` · `react-native-gesture-handler` | อนิเมชัน + ท่าทางสัมผัส |
| `react-native-safe-area-context` · `react-native-screens` | จัดการขอบจอ + navigation |
| `lucide-react-native` · `react-native-svg` | ไอคอน |
| `expo-secure-store` | เก็บ JWT อย่างปลอดภัยในเครื่อง |
| `expo-image` · `expo-image-picker` | แสดงรูป + เลือกรูปตอนแอดมินอัปโหลด |
| `@expo-google-fonts/*` | ฟอนต์ Kanit, Noto Sans Thai, Press Start 2P |
| `@react-native-community/netinfo` | ตรวจสถานะออนไลน์/ออฟไลน์ |
| `typescript` + `@types/react` (dev) | ตรวจชนิดข้อมูล |

> รายการเต็มดูใน [`package.json`](package.json) และ [`server/package.json`](server/package.json)

---

## วิธีติดตั้งและรัน (ตั้งแต่ต้น)

### 1. โคลนโปรเจกต์

```bash
git clone <URL ของ repo นี้>
cd MyProfileAppNindam
```

### 2. เตรียมฐานข้อมูล 🗄️

รัน 2 ไฟล์นี้ **ตามลำดับ**

| ลำดับ | ไฟล์ | ทำอะไร |
|------|------|--------|
| 1️⃣ | [`server/sql/schema.sql`](server/sql/schema.sql) | สร้างตาราง 12 ตาราง |
| 2️⃣ | [`server/sql/seed.sql`](server/sql/seed.sql) | ใส่ข้อมูลตั้งต้น (สินค้า 12 · หมวดหมู่ 7 · รูป 23 · สต๊อกสาขา 48 · คูปอง 3 · บัญชีทดสอบ 2) |

**วิธีรันผ่าน phpMyAdmin:** เลือก database → แท็บ **Import** → เลือกไฟล์ → Go
(หรือแท็บ **SQL** → เปิดไฟล์ copy มาวางทั้งหมด → Go)

**วิธีรันผ่าน command line:**
```bash
mysql -u root -p ip_std6730202645 < server/sql/schema.sql
mysql -u root -p ip_std6730202645 < server/sql/seed.sql
```

> 🔸 ถ้ายังไม่มี database ให้เปิด comment 2 บรรทัดบนสุดของ `schema.sql`
> (`CREATE DATABASE ...` / `USE ...`) ก่อนรัน
> 🔸 ทั้ง 2 ไฟล์ **รันซ้ำได้** — `schema.sql` ใช้ `CREATE TABLE IF NOT EXISTS`
> ส่วน `seed.sql` ล้างข้อมูลเดิมก่อนใส่ใหม่ (ไม่แตะ `orders` / `order_items` เพราะเป็นประวัติการสั่งซื้อ)

**ตรวจว่าข้อมูลเข้าครบ:**
```sql
SELECT COUNT(*) FROM products;              -- ต้องได้ 12
SELECT COUNT(*) FROM categories;            -- ต้องได้ 7
SELECT COUNT(*) FROM product_images;        -- ต้องได้ 23
SELECT COUNT(*) FROM product_branch_stock;  -- ต้องได้ 48
SELECT COUNT(*) FROM coupons;               -- ต้องได้ 3
SELECT id, name, brand FROM products LIMIT 5;  -- ภาษาไทยต้องไม่เป็น ???
```

**บัญชีทดสอบที่มากับ `seed.sql`:**

| อีเมล | รหัสผ่าน | สิทธิ์ |
|------|---------|-------|
| `admin@chaje.test` | `admin123` | 👑 แอดมิน — เพิ่ม/แก้/ลบสินค้าได้ |
| `user@chaje.test` | `user1234` | ลูกค้าทั่วไป (มีที่อยู่จัดส่งให้แล้ว 1 รายการ) |

> ⚠️ เป็นบัญชีสาธิตเท่านั้น ถ้านำไปใช้งานจริงให้ลบทิ้งหรือเปลี่ยนรหัสผ่าน

**คูปองที่ใช้ทดสอบได้:** `WELCOME100` (ลด 100 · ขั้นต่ำ 1,000) ·
`SAVE10` (ลด 10% · ขั้นต่ำ 2,000) · `FREESHIP` (ลด 150 · ขั้นต่ำ 500)

### 3. รัน Backend

```bash
cd server
npm install
cp .env.example .env      # Windows: copy .env.example .env
```

แก้ไฟล์ `.env` ให้ตรงกับเครื่องคุณ:
```ini
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=<รหัสผ่าน MySQL ของคุณ>
DB_NAME=ip_std6730202645
JWT_SECRET=<ค่าสุ่มยาวๆ — สร้างด้วย: openssl rand -hex 32>
JWT_EXPIRES=7d
```

แล้วสั่งรัน:
```bash
npm start
```
ต้องเห็น `✅ Chaje Electric API running on port 3000`

ทดสอบว่า API ทำงาน (เปิด terminal ใหม่):
```bash
curl http://localhost:3000/api/health      # ต้องได้ {"ok":true}
curl http://localhost:3000/api/products    # ต้องได้ JSON สินค้า 12 ตัว
```

### 4. ชี้แอปมาที่ backend ของคุณ

แก้ [`src/config.ts`](src/config.ts) บรรทัด `API_BASE_URL`:
```ts
export const API_BASE_URL = 'http://localhost:3000/api';
```
> ถ้าทดสอบบนมือถือจริง ต้องใช้ **IP ของเครื่องคอม** ไม่ใช่ `localhost`
> เช่น `http://192.168.1.10:3000/api` (มือถือมองไม่เห็น localhost ของคอม)

### 5. รัน Frontend

กลับมาที่โฟลเดอร์หลัก:
```bash
cd ..
npm install
npx expo start --web      # เปิดในเบราว์เซอร์ — ทดสอบง่ายที่สุด
```

หรือ `npx expo start` แล้วเลือกจากเมนูใน terminal:

| กด | เปิดที่ |
|----|--------|
| `w` | เว็บเบราว์เซอร์ |
| `a` | Android emulator |
| `i` | iOS simulator (เฉพาะ Mac) |
| สแกน QR | มือถือจริงผ่านแอป **Expo Go** |

**ดูเป็นหน้าจอมือถือบนเว็บ:** กด `F12` → `Ctrl+Shift+M` → เลือกรุ่นมือถือ

**ถ้าแก้โค้ดแล้วแอปไม่อัปเดต / เจอ error แปลกๆ:**
```bash
npx expo start --web -c   # ล้าง cache
```

### 6. ตรวจ type ก่อนส่งงาน

```bash
npx tsc --noEmit
```
ต้องได้ผลลัพธ์ว่างเปล่า (0 error)

---

## ทดสอบการทำงาน (end-to-end)

หลังเปิดทั้ง backend และ frontend แล้ว ลองเดินตามนี้:

1. เข้าสู่ระบบด้วย `user@chaje.test` / `user1234` → เห็นชื่อในหน้าโปรไฟล์
2. ค้นหาสินค้า → เปิดตัวกรอง เลือกยี่ห้อ/ราคา → ผลลัพธ์เปลี่ยนถูกต้อง
3. กดหัวใจสินค้า → รีเฟรชหน้า → หัวใจต้องยังติดอยู่ (พิสูจน์ว่าซิงก์กับเซิร์ฟเวอร์จริง)
4. เพิ่มสินค้าลงตะกร้า → ชำระเงิน → เลือกที่อยู่ → ใส่คูปอง `WELCOME100` → ยืนยันคำสั่งซื้อ
5. โปรไฟล์ → คำสั่งซื้อของฉัน → เห็นคำสั่งซื้อที่เพิ่งทำ
6. กดกระดิ่งแจ้งเตือน → เห็นแจ้งเตือน "สั่งซื้อสำเร็จ"
7. ออกจากระบบ → เข้าด้วย `admin@chaje.test` / `admin123` → เห็นเมนูจัดการสินค้า

---

## ปัญหาที่เจอบ่อย

| อาการ | สาเหตุ / วิธีแก้ |
|-------|----------------|
| ภาษาไทยเป็น `???` ใน DB | database ไม่ได้เป็น `utf8mb4` หรือ `db.js` ไม่ได้ตั้ง `charset` |
| `ER_ACCESS_DENIED_ERROR` ตอนรัน server | `DB_USER` / `DB_PASSWORD` ใน `.env` ไม่ถูก |
| `#1142 ... command denied` ตอนรัน SQL | user ของ DB สิทธิ์ไม่พอ — schema ชุดนี้เลี่ยง `FOREIGN KEY` และ `TRUNCATE` ไว้ให้แล้ว |
| แอปโหลดสินค้าไม่ขึ้น / ค้าง | backend ไม่ได้รัน หรือ `API_BASE_URL` ใน `src/config.ts` ผิด |
| มือถือจริงต่อ API ไม่ได้ | ใช้ `localhost` — ต้องเปลี่ยนเป็น IP ของเครื่องคอม |
| CORS error บนเว็บ | ลืม `app.use(cors())` ใน `server.js` |
| `401` ทุก endpoint | token หมดอายุ — ออกจากระบบแล้วเข้าใหม่ |
| อัปโหลดรูปแล้ว error | โฟลเดอร์ `server/uploads/` เขียนไม่ได้ (server สร้างให้อัตโนมัติตอนรัน) |

---

## เทคโนโลยีที่ใช้

**Frontend:** Expo SDK 57 · Expo Router · React 19 · TypeScript · React Native Reanimated ·
lucide-react-native · expo-secure-store

**Backend:** Node.js · Express 4 · MySQL 8 (mysql2) · JWT (jsonwebtoken) · bcrypt

---

## เอกสารเพิ่มเติมในโปรเจกต์

| ไฟล์ | เนื้อหา |
|------|--------|
| [`server/README.md`](server/README.md) | วิธี deploy backend ขึ้นเซิร์ฟเวอร์แบบละเอียด |
| [`รายงาน_3ส่วนUI.md`](รายงาน_3ส่วนUI.md) | รายงานอธิบายโค้ด UI 3 ส่วนหลัก |

## License

ดู [`LICENSE`](LICENSE)
