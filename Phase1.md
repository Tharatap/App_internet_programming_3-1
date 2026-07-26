# Phase 2 — ทำให้ Chaje Electric ใช้งานได้จริง + ต่อ Backend จริง (Node + Express + MySQL บนเซิร์ฟเวอร์อาจารย์)

> เอกสารนี้เขียนขึ้นเพื่อให้ AI/นักพัฒนาอ่านแล้วลงมือ implement ต่อได้ทันที
> อ่านหัวข้อ **"ข้อมูลเซิร์ฟเวอร์"** และ **"สถานะปัจจุบัน"** ให้จบก่อนเริ่มเขียนโค้ด

---

## Context — ทำไมต้องทำ

Phase 1 (ตาม `Phase1_UI_prompt.md`) สร้าง **UI ครบทุกหน้าแล้ว** และย้ายข้อมูลสินค้าออกจาก
hardcode ไปเป็น JSON บน GitHub สำเร็จ (`src/data/products.json` + `src/store/catalog-store.tsx`)

แต่ตอนนี้แอปยัง **"สวยแต่กดไม่ได้"** — ปุ่มจำนวนมากเป็น no-op, ข้อมูลอยู่ใน memory หายเมื่อ
refresh, ไม่มีระบบสมาชิก, กด "ชำระเงิน" แล้วไม่เกิดอะไรขึ้น

**เป้าหมาย Phase นี้:** ทำให้ทุกส่วนของ UI **ใช้งานได้จริง** โดยต่อกับ **Node + Express + MySQL
ที่รันอยู่บนเซิร์ฟเวอร์ของอาจารย์** พร้อมระบบสมาชิก และ flow สั่งซื้อครบวงจร (ไม่มีการตัดเงินจริง)

### ขอบเขตที่ตกลงแล้ว

| หัวข้อ | การตัดสินใจ |
|--------|-------------|
| Backend | **Node.js + Express + mysql2** รันบน **เซิร์ฟเวอร์อาจารย์** (SSH เข้าไปทำงานใน `/app`) |
| Database | **MySQL** ผ่าน phpMyAdmin — DB ชื่อ `ip_std6730202645` |
| ระบบสมาชิก | **มี** — สมัคร/เข้าสู่ระบบด้วย email + password (bcrypt + JWT) |
| ชำระเงิน | **ไม่ตัดเงินจริง** — สร้าง order สถานะ "รอชำระ / เก็บเงินปลายทาง" |
| Checkout | **ครบ flow**: ที่อยู่ → สรุป → สำเร็จ → ประวัติคำสั่งซื้อ |
| ต้องใช้งานได้จริง | ค้นหาสินค้า, โปรไฟล์ + เมนู 5 ข้อ, แจ้งเตือน + ตั้งค่า, แชร์สินค้า + ตัวกรองขั้นสูง |

---

## 🖥️ ข้อมูลเซิร์ฟเวอร์ (ตามที่อาจารย์กำหนด — ทดสอบ port แล้ว)

### การเข้าถึง

| รายการ | ค่า |
|--------|-----|
| **SSH Host** | `119.59.102.161` |
| **SSH Port** | **`2222`** 🟢 (ทดสอบแล้วเปิด) |
| Username | `std6730202645` |
| Password | ดูจาก http://nindam.ddns.net/web/ |
| **Workspace** | **`/app`** ← เขียนโค้ด backend ที่นี่ |
| phpMyAdmin | http://119.59.102.161/nindamdb |
| Database | **`ip_std6730202645`** · charset `utf8mb4_unicode_ci` |
| **Assigned backend port** | ⚠️ **ระบบจะแจ้งหลัง SSH login สำเร็จ** (เช่น `30xx`) — ต้องใช้ค่านี้ใน `.env` และ `server.js` |

### ทำไมต้องรัน Node บนเซิร์ฟเวอร์ (ไม่ใช่บนเครื่องเรา)

ทดสอบแล้ว: **port 3306 (MySQL) ปิดจากภายนอก** และ MySQL user เป็น `@localhost`
→ โปรแกรมบนเครื่องเราต่อ MySQL ตรงๆ **ไม่ได้**
→ แต่ Node ที่รัน**บนเซิร์ฟเวอร์** ต่อ MySQL ผ่าน `localhost` ได้สบาย

```
Expo App (เครื่องเรา) ──HTTP :30xx──► Express (บนเซิร์ฟเวอร์ /app) ──localhost:3306──► MySQL
```

> ❗ **ห้ามรัน Express บนเครื่องตัวเองแล้วต่อ MySQL ที่ 119.59.102.161** — ทำไม่ได้ port ปิด
> ❗ **ห้ามใช้ MongoDB** — อาจารย์กำหนด MySQL
> ❗ ทุกครั้งที่แก้โค้ด backend ต้องอัปโหลด/แก้บนเซิร์ฟเวอร์แล้ว **restart process** ถึงจะมีผล

### ขั้นตอนเข้าเซิร์ฟเวอร์

```bash
ssh std6730202645@119.59.102.161 -p 2222
# ใส่รหัสผ่าน → ระบบจะแจ้ง Assigned backend port (จดไว้!)
cd /app
```
บน Windows ใช้ PowerShell/cmd ได้เลย (มี ssh ในตัว) หรือใช้ PuTTY (Host `119.59.102.161`, Port `2222`)

---

## สถานะปัจจุบัน

### ✅ ที่มีอยู่แล้วและใช้ซ้ำได้ — **ห้ามเขียนใหม่ทับ**

**Components** (`src/components/shop/`)

| Component | รายละเอียด |
|-----------|-----------|
| `ProductCard` | มี variant `grid` (2 คอลัมน์) และ `row` (แนวนอน) + stagger animation |
| `TopBar` | variant `home` / `list` + export `FloatingHeader` (ลอยบนรูปในหน้า detail) |
| `IconButton` | ปุ่มวงกลม มี variant `surface`/`floating`/`favorite` + จุดแดงแจ้งเตือน |
| `Badge` | ป้าย pill มี tone `success`/`accent`/`neutral`/`danger` |
| `Checkbox` | สี่เหลี่ยมมุมโค้ง พื้นเขียวมะนาวเมื่อติ๊ก |
| `QuantityStepper` | ปุ่ม −/+ พร้อมตัวเลขตรงกลาง |
| `SkeletonImage` | รูป + พื้นเทา fallback + `onError` (ทำเสร็จแล้ว) |
| `CategoryIcon` | ไอคอนหมวดหมู่วงกลม (map lucide icon) |
| `SectionHeader` | หัวข้อ section + badge + ลิงก์ "ดูทั้งหมด" |
| `PressableScale` | Pressable ที่กดแล้วย่อ 0.97 ใน 150ms — **ใช้ตัวนี้กับทุกปุ่ม** |
| `HeartButton` | ปุ่มหัวใจ + micro-bounce animation |

**Utils / Constants**
- `src/utils/format.ts` — `formatBaht()`, `formatCountdown()` → **ใช้ตัวนี้ ห้ามเขียน format ราคาใหม่**
- `src/constants/theme.ts` — `Brand` (สีทั้งชุด), `Radius`, `AppFrameWidth` (480px สำหรับ web frame)
- `src/hooks/use-countdown.ts` — นับถอยหลัง flash sale

**Store / Data**
- `src/store/catalog-store.tsx` — `CatalogProvider` + `useCatalog()` มี pattern fetch + fallback ที่ดีอยู่แล้ว
- `src/store/shop-store.tsx` — `ShopProvider` + `useShop()` (cart/favorites, in-memory)
- `src/data/products.json` (12 สินค้า) + `categories.json` (7 หมวด)
- `src/types/product.ts` — `Product`, `Category`, `CartItem`, `BranchStock`

**✅ SQL พร้อมแล้ว (สร้างไว้ให้แล้ว — แค่เอาไปรัน)**
- `server/sql/schema.sql` — 11 ตาราง พร้อม FK/index/utf8mb4
- `server/sql/seed.sql` — 12 สินค้า · 7 หมวด · 23 รูป · 48 สาขา · 3 คูปอง (มี `brand` ครบแล้ว)

**Routing** — Expo Router v57, root คือ `src/app/`, มี `(tabs)` 5 แท็บ + `product/[id]` + `products`

### ❌ จุดที่ยัง "กดไม่ได้" (ต้องแก้ทั้งหมด)

| ไฟล์ | บรรทัด | อาการ |
|------|--------|-------|
| `src/app/(tabs)/cart.tsx` | 69 | **🐛 BUG จริง** — `<SkeletonImage>` ไม่ได้ส่ง `uri` → รูปสินค้าในตะกร้าเป็นกล่องเทาเสมอ |
| `src/app/(tabs)/cart.tsx` | 97 | ปุ่ม "ชำระเงิน" ไม่มี `onPress` |
| `src/app/(tabs)/cart.tsx` | 34 | แถบที่อยู่จัดส่งกดไม่ได้ |
| `src/app/(tabs)/index.tsx` | 36–37 | `onSettings={() => {}}` / `onNotification={() => {}}` |
| `src/app/(tabs)/index.tsx` | 51 | Search bar เป็น `Pressable` เฉยๆ ไม่มีช่องพิมพ์ ไม่มีการค้นหาจริง |
| `src/app/(tabs)/profile.tsx` | 53 | เมนู 5 ข้อไม่มี `onPress` เลย + ชื่อ/อีเมล hardcode |
| `src/app/products.tsx` | 12–35 | Filter chips ทำได้แค่ sort · ไม่รับ query ค้นหา |
| `src/components/shop/top-bar.tsx` | `FloatingHeader` | ปุ่ม share ไม่มี handler |
| `src/app/product/[id].tsx` | 120 | ปุ่ม info (ผ่อนชำระ) ไม่มี handler |
| `src/store/shop-store.tsx` | ทั้งไฟล์ | cart/favorites อยู่ใน memory → **refresh แล้วหาย** + seed hardcode (`p1`,`p3`,`p2`,`p5`) |

**ยังไม่มีเลย:** ระบบสมาชิก · ที่อยู่จัดส่ง · คำสั่งซื้อ/ประวัติ · แจ้งเตือน · ตั้งค่า · คูปอง · error boundary · offline handling

---

## สถาปัตยกรรมเป้าหมาย

```
[ บนเซิร์ฟเวอร์อาจารย์  /app  (เข้าผ่าน SSH port 2222) ]
/app/
├── server.js              จุดเริ่ม Express — ต้อง listen ที่ Assigned port
├── .env                   ⚠️ ห้าม commit — DB_PASS, JWT_SECRET, PORT
├── db.js                  mysql2 connection pool
├── middleware/
│   ├── auth.js            ตรวจ JWT → req.userId
│   └── error.js           error handler กลาง
└── routes/
    ├── auth.js            register · login · me
    ├── products.js        list (q/filter/sort/page) · detail · brands
    ├── categories.js
    ├── cart.js · favorites.js
    ├── addresses.js · orders.js · notifications.js

[ ในเครื่องเรา (repo นี้) ]
server/sql/                ✅ schema.sql + seed.sql (รันใน phpMyAdmin)
src/
├── api/                   🆕 client.ts + auth/products/cart/orders/...
├── store/                 catalog-store (แก้ให้ยิง API), shop-store (sync), 🆕 auth-store
└── app/
    ├── (auth)/            🆕 login, register
    ├── (tabs)/            เดิม 5 แท็บ (wire ปุ่มให้ครบ)
    ├── checkout/          🆕 address → summary → success
    ├── orders/            🆕 index, [id]
    ├── addresses/         🆕 index, edit
    ├── search.tsx · notifications.tsx · settings.tsx · coupons.tsx   🆕
```

**Data flow:** `App → src/api/client.ts (แนบ JWT) → Express บนเซิร์ฟเวอร์ → MySQL (localhost)`
คง GitHub JSON ไว้เป็น **offline fallback ชั้นสุดท้าย** ใน `catalog-store.tsx`

---

## PART A — Backend (Node + Express + MySQL บนเซิร์ฟเวอร์)

### A0. เตรียม Database (ทำก่อนอย่างอื่น)

เปิด phpMyAdmin → เลือก DB `ip_std6730202645` → แท็บ **SQL** (หรือ **Import**)
1. รัน `server/sql/schema.sql` → ได้ 11 ตาราง
2. รัน `server/sql/seed.sql` → ได้สินค้า 12 รายการ
3. ตรวจ: `SELECT COUNT(*) FROM products;` ต้องได้ **12** และภาษาไทยต้องไม่เป็น `???`

### A1. Setup บนเซิร์ฟเวอร์

```bash
ssh std6730202645@119.59.102.161 -p 2222
cd /app
npm init -y
npm install express cors mysql2 bcrypt jsonwebtoken dotenv
```

`/app/.env` (**ห้าม commit** — ทำ `.env.example` คู่ไว้ในเครื่อง):
```
PORT=<Assigned backend port ที่ระบบแจ้งตอน login เช่น 3045>
DB_HOST=localhost
DB_USER=std6730202645
DB_PASSWORD=<รหัสผ่านจาก nindam.ddns.net/web/>
DB_NAME=ip_std6730202645
JWT_SECRET=<สุ่มค่ายาว ≥32 ตัวอักษร>
JWT_EXPIRES=7d
```

### A2. `server.js` — จุดที่พลาดบ่อย

```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());                 // ⚠️ ขาดไม่ได้ — Expo web เรียกข้ามโดเมน
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
// ... routes

const PORT = process.env.PORT;   // ⚠️ ต้องเป็น Assigned port เท่านั้น
app.listen(PORT, '0.0.0.0', () => console.log('API on ' + PORT));
```

> ⚠️ **ต้อง `listen(PORT, '0.0.0.0')`** ไม่ใช่ `listen(PORT)` เฉยๆ หรือ `127.0.0.1`
> ไม่งั้นเครื่องภายนอกเรียกไม่ถึง
> ⚠️ ใช้ **Assigned port ที่ได้รับเท่านั้น** — port อื่นถูกไฟร์วอลล์ปิด

### A3. `db.js` — connection pool

```js
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4_unicode_ci',   // ⚠️ ไม่ใส่ = ภาษาไทยเพี้ยน
});
module.exports = pool;
```

### A4. Endpoints

| Method | Path | Auth | หมายเหตุ |
|--------|------|:----:|----------|
| GET | `/api/health` | – | ทดสอบว่า server ออนไลน์ |
| POST | `/api/auth/register` | – | `{email,password,name}` → `{token,user}` |
| POST | `/api/auth/login` | – | → `{token,user}` |
| GET | `/api/auth/me` | ✓ | → user |
| GET | `/api/products` | – | `?q=&category=&brand=&minPrice=&maxPrice=&energyMin=&inStock=&sort=&page=&limit=` |
| GET | `/api/products/:id` | – | รวม images + branchStock |
| GET | `/api/products/brands` | – | รายชื่อยี่ห้อ (ทำตัวกรอง) |
| GET | `/api/categories` | – | |
| GET/POST/PATCH/DELETE | `/api/cart` · `/api/cart/:productId` | ✓ | |
| GET/POST/DELETE | `/api/favorites` · `/api/favorites/:productId` | ✓ | |
| GET/POST/PATCH/DELETE | `/api/addresses` · `/api/addresses/:id` | ✓ | |
| POST | `/api/orders` | ✓ | สร้างจาก cart ที่ `selected=1` → เคลียร์ cart → สร้าง notification |
| GET | `/api/orders` · `/api/orders/:id` | ✓ | |
| GET | `/api/notifications` · PATCH `/api/notifications/:id/read` | ✓ | |
| GET | `/api/coupons` | ✓ | |
| PATCH | `/api/users/me/settings` | ✓ | ธีม/ภาษา/แจ้งเตือน |

**สำคัญ — รูปแบบ JSON ที่คืน:** ต้องตรงกับ `src/types/product.ts`
- ใช้ **camelCase** (`originalPrice`, `energySavingPercent`, `inStock`, `isFlashSale`, `branchStock`)
  แม้ในฐานข้อมูลจะเป็น snake_case
- `images` ต้องเป็น **array ของ string** (JOIN จาก `product_images` เรียงตาม `sort_order`)
- `specs` ต้องเป็น object `{ power, suitableRoom, warranty }` (ประกอบจาก `spec_*`)
- `branchStock` เป็น array ของ `{ id, name, inStock }`

### A5. การค้นหาภาษาไทย

**อย่าใช้ FULLTEXT** — ภาษาไทยไม่มีช่องว่างระหว่างคำ MySQL ตัดคำไม่ถูก ผลลัพธ์จะเพี้ยน
ใช้แบบนี้แทน:
```sql
WHERE (name LIKE CONCAT('%', ?, '%') OR description LIKE CONCAT('%', ?, '%'))
```

### A6. กฎความปลอดภัย (บังคับ)

1. ใช้ **prepared statement** ทุก query: `pool.execute('... WHERE id = ?', [id])`
   ห้ามต่อ string เข้า SQL เด็ดขาด
2. รหัสผ่าน hash ด้วย **bcrypt** (salt rounds ≥ 10) — **ห้ามคืน `password_hash` กลับไปหา client**
3. ทุก endpoint ที่ต้องล็อกอินผ่าน `auth` middleware
4. **IDOR** — query ข้อมูลผู้ใช้ต้องมี `WHERE user_id = ?` เสมอ ห้ามเชื่อ id จาก client
5. **คำนวณยอดเงินใหม่ฝั่ง server เสมอ** ห้ามเชื่อราคา/ยอดรวมที่ client ส่งมา
6. สร้าง order ต้องใช้ **transaction** (`conn.beginTransaction()` / `commit()` / `rollback()`)
7. Order เก็บ **snapshot ชื่อ/ราคา/รูป/ที่อยู่ ณ ตอนสั่ง** (ตาราง `order_items` ออกแบบไว้แล้ว)
8. `.env` ต้องอยู่ใน `.gitignore` · error handler ห้ามส่ง stack trace ออกไปหา client

### A7. ทำให้ server ไม่ตายเมื่อปิด SSH

```bash
npm install -g pm2          # ถ้าไม่มีสิทธิ์ ใช้ nohup แทน
pm2 start server.js --name chaje-api
pm2 save
# ทางเลือก: nohup node server.js > out.log 2>&1 &
```

---

## PART B — เชื่อม Frontend เข้ากับ API

### B1. API client

```
src/config.ts     → เพิ่ม API_BASE_URL = 'http://119.59.102.161:<ASSIGNED_PORT>/api'
src/api/client.ts → fetch wrapper: แนบ Authorization: Bearer <token>, parse error, timeout
src/api/{auth,products,cart,favorites,addresses,orders,notifications}.ts
```

> ✅ **ข้อดี:** ใช้ IP เซิร์ฟเวอร์ ไม่ใช่ localhost → มือถือจริงเรียกได้เลย ไม่ต้องตั้ง IP เครื่องตัวเอง
> ⚠️ เป็น `http://` ไม่ใช่ https → Android ต้องเปิด `usesCleartextTraffic: true` ใน `app.json`
>    (`expo.android.usesCleartextTraffic`)

### B2. Auth store

- สร้าง `src/store/auth-store.tsx` — `AuthProvider` + `useAuth()`
- เก็บ token ด้วย **`expo-secure-store`** (native) / `localStorage` (web)
  → `npx expo install expo-secure-store`
- state: `user`, `token`, `loading`, `login()`, `register()`, `logout()`
- เปิดแอป: อ่าน token → เรียก `/api/auth/me` → ถ้าไม่ผ่านให้ logout
- วางไว้ **นอกสุด** ใน `src/app/_layout.tsx`: `AuthProvider > CatalogProvider > ShopProvider`

### B3. Route guard

- สร้าง `src/app/(auth)/login.tsx` + `register.tsx`
  (design system เดิม: ปุ่ม pill `Brand.accent`, input พื้น `Brand.surface`)
- **Home / Catalog / Product detail ดูได้โดยไม่ต้องล็อกอิน**
- **ตะกร้า / โปรด / โปรไฟล์ / สั่งซื้อ ต้องล็อกอิน** → `router.replace('/(auth)/login')`

### B4. แก้ store เดิม

- **`catalog-store.tsx`** — ลำดับ `Express API → GitHub JSON → bundled JSON` (คงโครง fallback เดิม)
  + เพิ่ม `refresh()` สำหรับ pull-to-refresh
- **`shop-store.tsx`** — cart/favorites sync กับ server เมื่อล็อกอิน (optimistic update แล้วยิง API)
  **ลบ seed hardcode (`p1`,`p3`,`p2`,`p5`) ออก**

---

## PART C — ทำให้ทุกปุ่มใช้งานได้จริง

### C1. 🐛 แก้บั๊กก่อน (ทำก่อนเลย เห็นผลทันที)

`src/app/(tabs)/cart.tsx:69` →
```tsx
<SkeletonImage uri={item.product.images[0]} style={styles.itemImage} borderRadius={Radius.md} />
```

### C2. ค้นหาสินค้าจริง
- 🆕 `src/app/search.tsx` — `TextInput` autofocus, debounce 300ms, ยิง `/api/products?q=`,
  เก็บประวัติค้นหาลง AsyncStorage, empty state, ใช้ `ProductCard variant="row"`
- `src/app/(tabs)/index.tsx:51` → `router.push('/search')`
- `src/app/products.tsx` → รับ `?q=` ส่งต่อ API

### C3. ตัวกรองขั้นสูง
- 🆕 `src/components/shop/filter-sheet.tsx` — bottom sheet: ยี่ห้อ (จาก `/api/products/brands`) ·
  ช่วงราคา · เบอร์ประหยัดไฟ · มีของ/หมด · การจัดเรียง + ปุ่ม "ล้างตัวกรอง" / "ดูผลลัพธ์ (N)"
- `products.tsx` → chips เดิมเป็น quick filter + ปุ่ม filter บน `TopBar` เปิด sheet

### C4. Checkout flow ครบ
```
cart "ชำระเงิน" → /checkout/address → /checkout/summary → POST /api/orders
                                                        → /checkout/success → /orders
```
- 🆕 `checkout/address.tsx` (เลือก/เพิ่มที่อยู่) · `checkout/summary.tsx` (สินค้า+ค่าส่ง+ยอดรวม) ·
  `checkout/success.tsx` (เลข order + ปุ่มดูคำสั่งซื้อ)
- **ป้องกันกดซ้ำ** (disable ปุ่มระหว่างยิง API)

### C5. โปรไฟล์ + เมนู 5 ข้อ
`profile.tsx` — แสดง `user.name`/`user.email` จาก `useAuth()` (เลิก hardcode) + ปุ่ม "ออกจากระบบ"

| เมนู | ปลายทาง |
|------|---------|
| คำสั่งซื้อของฉัน | 🆕 `src/app/orders/index.tsx` + `orders/[id].tsx` (มี status badge) |
| ที่อยู่จัดส่ง | 🆕 `src/app/addresses/index.tsx` + `addresses/edit.tsx` |
| คูปองส่วนลด | 🆕 `src/app/coupons.tsx` (ตาราง `coupons` มี seed แล้ว 3 ใบ) |
| รายการโปรด | `router.push('/(tabs)/favorites')` |
| ตั้งค่า | 🆕 `src/app/settings.tsx` |

### C6. แจ้งเตือน + ตั้งค่า
- 🆕 `notifications.tsx` — list + mark as read → จุดแดงบน `TopBar` ผูกกับจำนวนที่ยังไม่อ่านจริง
- 🆕 `settings.tsx` — ธีม / ภาษา / แจ้งเตือนโปรโมชัน / ล้างแคช / ออกจากระบบ
- `index.tsx:36–37` → `router.push('/settings')` / `router.push('/notifications')`

### C7. แชร์สินค้า + ปุ่มที่เหลือ
- `FloatingHeader` — ปุ่ม share ใช้ `Share.share()` (native) / `navigator.share` (web)
  แชร์ชื่อ + deep link (`scheme: myprofileappnindam` มีอยู่แล้วใน `app.json`)
- `product/[id].tsx:120` — ปุ่ม info เปิด modal เงื่อนไขผ่อนชำระ
- `cart.tsx:34` — แถบที่อยู่ → `router.push('/addresses')`

---

## PART D — Production hardening

1. **Error boundary** ครอบ `src/app/_layout.tsx`
2. **Loading / empty / error states** ทุกหน้าที่ยิง API
3. **Offline** — จับ network error → แถบ "ออฟไลน์ – แสดงข้อมูลล่าสุด" + ปุ่มลองใหม่
4. **Pull-to-refresh** Home / Product list / Orders
5. **Pagination** — infinite scroll ที่ Product list (`onEndReached`)
6. **Validation** ทั้ง client และ server (email, password ≥ 8, เบอร์โทร, รหัสไปรษณีย์)
7. **Security** — ดู A6 ทั้งหมด + ตรวจว่า `.env` ไม่หลุดขึ้น GitHub
8. **pm2** ให้ API ไม่ตายเมื่อปิด SSH (A7)
9. **Accessibility** — `accessibilityLabel` ทุกปุ่ม
10. **`npx tsc --noEmit` ผ่าน 0 error**

---

## ลำดับการลงมือ

| Step | งาน | ผลที่ได้ |
|------|-----|---------|
| 1 | 🐛 แก้บั๊กรูปในตะกร้า (`cart.tsx:69`) | เห็นผลทันที ไม่ต้องรอ backend |
| 2 | รัน `schema.sql` + `seed.sql` ใน phpMyAdmin | 11 ตาราง + สินค้า 12 ตัวใน MySQL |
| 3 | SSH เข้า `/app` → npm init + install → **จด Assigned port** | พร้อมเขียน backend |
| 4 | `server.js` + `db.js` + `/api/health` + `/api/products` | เปิด `http://119.59.102.161:PORT/api/products` เห็น JSON |
| 5 | Auth (register/login/me) + `auth-store` + หน้า login | สมัคร/ล็อกอินได้จริง |
| 6 | แก้ `catalog-store` ให้ยิง API | สินค้ามาจาก MySQL ของอาจารย์ |
| 7 | Cart + Favorites + sync `shop-store` | refresh แล้วข้อมูลไม่หาย |
| 8 | Addresses + Checkout + Orders | สั่งซื้อครบ flow |
| 9 | Search + Filter sheet | ค้นหา/กรองได้จริง |
| 10 | Notifications + Settings + Coupons + Share + hardening | ไม่เหลือปุ่มตาย พร้อมส่ง |

---

## Verification — ทดสอบยังไง

### Database (phpMyAdmin)
```sql
USE ip_std6730202645;
SHOW TABLES;                          -- 11 ตาราง
SELECT COUNT(*) FROM products;        -- 12
SELECT COUNT(*) FROM categories;      -- 7
SELECT id, name, brand FROM products LIMIT 5;   -- ภาษาไทยต้องไม่เป็น ???
```

### Backend (จากเครื่องเรา)
```bash
curl http://119.59.102.161:<PORT>/api/health          # {"ok":true}
curl http://119.59.102.161:<PORT>/api/products        # JSON 12 รายการ
curl -X POST http://119.59.102.161:<PORT>/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"12345678","name":"Test"}'
```
ถ้า `curl` ไม่ตอบ ให้เช็คตามลำดับ: process ยังรันอยู่ไหม (`pm2 list`) →
`listen('0.0.0.0')` หรือยัง → ใช้ Assigned port ถูกไหม

### Frontend
```bash
npx expo start --web -c     # F12 → Ctrl+Shift+M ดูเป็นมือถือ
npx tsc --noEmit            # ต้อง 0 error
```

### เดินให้ครบ flow (end-to-end)
1. สมัครสมาชิก → ล็อกอิน → เห็นชื่อตัวเองในโปรไฟล์
   → เช็ค phpMyAdmin: ตาราง `users` มีแถวใหม่ และ `password_hash` **ไม่ใช่รหัสดิบ**
2. ค้นหา "แอร์" → เห็นผล → เปิดตัวกรอง เลือกยี่ห้อ → ผลเปลี่ยน
3. กดหัวใจ → **refresh** → หัวใจยังติดอยู่ (พิสูจน์ว่า sync server จริง)
4. เพิ่มลงตะกร้า → badge เพิ่ม → ชำระเงิน → เลือกที่อยู่ → สรุป → สำเร็จ
   → เช็ค phpMyAdmin: มีแถวใน `orders` + `order_items`
5. โปรไฟล์ → คำสั่งซื้อของฉัน → เห็น order ที่เพิ่งสั่ง
6. กดกระดิ่ง → เห็นแจ้งเตือน "สั่งซื้อสำเร็จ" → จุดแดงหายหลังอ่าน
7. เมนูโปรไฟล์ทั้ง 5 ข้อ → เปิดได้จริงทุกข้อ
8. ปิด API (`pm2 stop`) → แอปต้องไม่ crash, ขึ้นแถบออฟไลน์, ยังเห็นสินค้าจาก fallback

**เกณฑ์ผ่าน:** ไม่มีปุ่มไหนกดแล้วไม่เกิดอะไรขึ้น · refresh แล้วข้อมูลไม่หาย ·
ข้อมูลจริงอยู่ใน MySQL ตรวจสอบได้ใน phpMyAdmin · `tsc --noEmit` 0 error

---

## หมายเหตุสำหรับผู้ implement

- โปรเจกต์นี้ใช้ **Expo SDK 57** — อ่าน https://docs.expo.dev/versions/v57.0.0/ ก่อนเขียนโค้ด
- **ห้ามสร้าง component ใหม่ทับของเดิม** — ต่อยอดจาก `src/components/shop/`
- ยึด design tokens ใน `src/constants/theme.ts` — **ห้าม hardcode สี**
- ติดตั้ง native module ด้วย `npx expo install` (ไม่ใช่ `npm i`)
- ข้อความ UI ทั้งหมดเป็น **ภาษาไทย**
- **Backend ไม่มี hot reload** — แก้แล้วต้อง `pm2 restart chaje-api` ทุกครั้ง
- ⚠️ **ห้ามใส่รหัสผ่าน/JWT secret ลงในโค้ดที่ push ขึ้น GitHub** ใช้ `.env` เท่านั้น
