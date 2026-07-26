# PROGRESS — บันทึกความคืบหน้า

> **สำหรับ AI:** อ่านไฟล์นี้ก่อนเริ่มงานเสมอ เพื่อไม่ต้องสำรวจโค้ดซ้ำ (ประหยัด token)
> **ทำงานเสร็จแต่ละก้อน → กลับมาอัปเดตไฟล์นี้ทันที** (ดูวิธีอัปเดตท้ายไฟล์)

**อัปเดตล่าสุด:** 2026-07-27 · **สถานะรวม:** Phase 1 เสร็จ 100% · Phase 2: PART A (backend) ✅ deploy สำเร็จ+ทดสอบผ่านหมด · PART B (เชื่อม frontend เข้า API) ✅ เขียนเสร็จ ผ่าน typecheck 0 error · ยังไม่ได้ทดสอบจริงบนมือถือ/เว็บ

---

## ✅ Phase 1 — UI + ย้ายข้อมูลออกจาก hardcode (เสร็จแล้ว)

### หน้าจอที่สร้างเสร็จ (ใช้งานได้ ดูสวย)
| หน้า | ไฟล์ | สถานะ |
|------|------|-------|
| Home | `src/app/(tabs)/index.tsx` | ✅ header, search bar, promo banner, หมวดหมู่, flash sale + countdown, แนะนำ (grid 2 คอลัมน์) |
| หมวดหมู่ | `src/app/(tabs)/catalog.tsx` | ✅ grid หมวดหมู่ + สินค้ายอดนิยม |
| ตะกร้า | `src/app/(tabs)/cart.tsx` | ✅ checkbox เลือกทั้งหมด, stepper, ยอดรวม, ปุ่ม sticky |
| รายการโปรด | `src/app/(tabs)/favorites.tsx` | ✅ grid + empty state |
| โปรไฟล์ | `src/app/(tabs)/profile.tsx` | ✅ การ์ดผู้ใช้ + เมนู 5 ข้อ |
| รายการสินค้า | `src/app/products.tsx` | ✅ filter chips + list แนวนอน |
| รายละเอียดสินค้า | `src/app/product/[id].tsx` | ✅ gallery เลื่อนได้ + dots, badge, การ์ดราคา, สเปค, สต๊อกสาขา, ปุ่ม sticky |
| Bottom Tab (5 แท็บ) | `src/app/(tabs)/_layout.tsx` | ✅ badge ตัวเลขบนตะกร้าทำงานจริง |

### Component ที่สร้างเสร็จ — **11 ตัว ใช้ซ้ำได้ ห้ามเขียนใหม่**
`src/components/shop/` : `ProductCard` · `TopBar` (+`FloatingHeader`) · `IconButton` · `Badge` ·
`Checkbox` · `QuantityStepper` · `SkeletonImage` · `CategoryIcon` · `SectionHeader` ·
`PressableScale` · `HeartButton`

→ **props ของแต่ละตัวดูใน skill `chaje-shop`** (ไม่ต้องเปิดอ่านไฟล์ทีละตัว)

### ระบบข้อมูล (สำคัญ — ทำเสร็จแล้ว อย่าทำซ้ำ)
- ✅ ย้ายข้อมูลออกจาก hardcode → `src/data/products.json` (12 สินค้า) + `categories.json` (7 หมวด)
- ✅ **ลบ `mockProducts.ts` / `mockCategories.ts` ทิ้งแล้ว** — ไม่มีไฟล์นี้อีกต่อไป
- ✅ `src/store/catalog-store.tsx` — `CatalogProvider` + `useCatalog()`
  ดึงจาก GitHub raw → fallback เป็น JSON ใน bundle ถ้าเน็ตล่ม
- ✅ `src/config.ts` — ตั้งค่า GitHub repo แล้ว (`Tharatap/App_internet_programming_3-1`, branch `master`)
- ✅ **ทดสอบแล้วว่าดึงจาก GitHub สำเร็จจริง** (Network tab: 200 OK, `access-control-allow-origin: *`)
- ✅ รูปสินค้าเป็น URL จริงจากเว็บแบรนด์ (Samsung/Electrolux/Philips ฯลฯ) ครบทั้ง 12 ตัว

### เรื่องอื่นที่ทำเสร็จแล้ว
- ✅ ติดตั้ง `lucide-react-native` + `react-native-svg` (ไอคอนทั้งแอป)
- ✅ Responsive บนเว็บ — จอกว้างแสดงเป็นคอลัมน์มือถือกลางจอ (`AppFrameWidth = 480` ใน theme.ts)
- ✅ Animation: กดปุ่มย่อ 0.97, การ์ด fade-in แบบ stagger, หัวใจ micro-bounce
- ✅ `npx tsc --noEmit` ผ่าน 0 error

---

## ❌ ยังไม่ได้ทำ — Phase 2 (แผนเต็มอยู่ใน `Phase1.md`)

### 🐛 บั๊กที่รู้แล้ว ยังไม่แก้
| ไฟล์ | บรรทัด | อาการ |
|------|--------|-------|
| `src/app/(tabs)/cart.tsx` | 69 | `<SkeletonImage>` ไม่ได้ส่ง `uri` → รูปสินค้าในตะกร้าเป็นกล่องเทาเสมอ **(แก้ง่าย ทำก่อนได้เลย)** |

### ปุ่มที่ยัง "กดไม่ได้"
| ไฟล์ | บรรทัด | อาการ |
|------|--------|-------|
| `src/app/(tabs)/index.tsx` | 36–37 | `onSettings` / `onNotification` = `() => {}` |
| `src/app/(tabs)/index.tsx` | 51 | search bar กดแล้วไปหน้า products แต่ **ไม่มีช่องพิมพ์ ไม่มีการค้นหาจริง** |
| `src/app/(tabs)/cart.tsx` | 34 | แถบที่อยู่จัดส่งกดไม่ได้ |
| `src/app/(tabs)/cart.tsx` | 97 | ปุ่ม "ชำระเงิน" ไม่มี `onPress` |
| `src/app/(tabs)/profile.tsx` | 53 | เมนู 5 ข้อไม่มี `onPress` + ชื่อ/อีเมล hardcode |
| `src/app/product/[id].tsx` | 120 | ปุ่ม info (ผ่อนชำระ) ไม่มี handler |
| `src/components/shop/top-bar.tsx` | `FloatingHeader` | ปุ่ม share ไม่มี handler |
| `src/app/products.tsx` | 12–35 | filter chips ทำได้แค่ sort · **ไม่มี field `brand` ใน data** · ไม่รับ query ค้นหา |

### ระบบที่ยังไม่มีเลย
Backend (Express + MySQL) · ระบบสมาชิก (JWT) · ที่อยู่จัดส่ง · คำสั่งซื้อ/ประวัติ ·
แจ้งเตือน · ตั้งค่า · คูปอง · error boundary · offline handling ·
**cart/favorites หายเมื่อ refresh** (อยู่ใน memory + ยังมี seed hardcode `p1`,`p3`,`p2`,`p5` ใน `shop-store.tsx`)

### ✅ SQL พร้อมแล้ว (สร้างไว้แล้ว — เหลือแค่เอาไปรัน)
- `server/sql/schema.sql` — 11 ตาราง พร้อม FK/index/utf8mb4
- `server/sql/seed.sql` — 12 สินค้า · 7 หมวด · 23 รูป · 48 สาขา · 3 คูปอง (เติม `brand` ครบแล้ว)
- ⏳ **ยังไม่ได้รันใน phpMyAdmin** — เป็นงานถัดไป (ผู้ใช้จะทำเอง)

### ✅ Backend Express — เขียนโค้ดเสร็จแล้วทั้งหมด (PART A) — รอ deploy เท่านั้น

**อยู่ในโฟลเดอร์ `server/`** ทดสอบแล้วว่า syntax ผ่านหมด + boot ได้จริง + `/api/health` ตอบ 200
(ทดสอบในเครื่อง local ด้วยรหัสผ่านปลอม เพราะต่อ MySQL จริงจากเครื่องไม่ได้ — ผู้ใช้ต้อง deploy บนเซิร์ฟเวอร์เพื่อทดสอบกับ DB จริง)

| ไฟล์ | เนื้อหา |
|------|---------|
| `server/server.js` | entrypoint — cors, json, ต่อ route ทั้งหมด, `listen(PORT,'0.0.0.0')` |
| `server/db.js` | mysql2 pool (utf8mb4_unicode_ci) |
| `server/middleware/auth.js` | ตรวจ JWT → `req.userId` |
| `server/middleware/error.js` | error handler กลาง + `asyncHandler` wrapper |
| `server/routes/auth.js` | register (bcrypt) · login · me |
| `server/routes/products.js` | list (search/filter/sort/pagination) · detail (join images+branchStock) · brands |
| `server/routes/categories.js` | list |
| `server/routes/cart.js` | get · add (upsert) · patch (qty/selected) · delete · select-all |
| `server/routes/favorites.js` | get ids · toggle |
| `server/routes/addresses.js` | CRUD เต็ม + auto unset default เดิม |
| `server/routes/orders.js` | **POST มี transaction เต็ม** — คำนวณราคาจาก DB จริง (ไม่เชื่อ client), เช็ค stock, snapshot ที่อยู่/ราคา, เคลียร์ cart, สร้าง notification |
| `server/routes/notifications.js` | list · mark read |
| `server/routes/coupons.js` | list (active + ไม่หมดอายุ) |
| `server/routes/users.js` | PATCH settings (theme/language/notifyPromo) |
| `server/package.json` | dependencies ครบ (express, cors, mysql2, bcrypt, jsonwebtoken, dotenv) |
| `server/.env.example` | template — copy เป็น `.env` แล้วใส่ค่าจริง |
| `server/README.md` | **คู่มือ deploy ทีละขั้นตอน** (SSH → scp → npm install → .env → รัน → curl ทดสอบ → pm2) |

### ✅ Backend deploy สำเร็จแล้ว — API มีชีวิตอยู่จริงบนเซิร์ฟเวอร์

- ✅ รัน `schema.sql` + `seed.sql` ใน phpMyAdmin สำเร็จ (11 ตาราง, 12 สินค้า)
- ✅ SSH เข้า `119.59.102.161:2222` ได้ → **Assigned backend port = 3059**
- ✅ อัปโหลดโค้ดขึ้น `/app` ผ่าน FileZilla สำเร็จ
- ✅ แก้บั๊ก `npm install` ขาด `dotenv` แล้ว (รัน `npm install express cors mysql2 bcrypt jsonwebtoken dotenv` ซ้ำ)
- ✅ ตั้งค่า `server/.env` ครบ (DB_PASSWORD จริงใส่แล้ว)
- ✅ **`node server.js` รันสำเร็จ + ทดสอบจริงจากเครื่อง client แล้ว:**
  `curl http://119.59.102.161:3059/api/products` → คืน JSON สินค้าจริงจาก MySQL
  ภาษาไทยไม่เพี้ยน โครงสร้าง camelCase ตรงกับ `src/types/product.ts` ทุกฟิลด์ ✅

**✅ ทดสอบครบทุก endpoint หลักแล้ว — ผ่านหมด:**
- `GET /api/health` → `{"ok":true}`
- `GET /api/categories` → 7 หมวดหมู่ ภาษาไทยถูกต้อง
- `GET /api/products` → 12 สินค้า ครบทุกฟิลด์
- `POST /api/auth/register` → ได้ JWT token + user (ไม่หลุด password_hash) ✅
- `POST /api/auth/login` → ได้ JWT token ใหม่ + user เดิม ✅

**⏸️ พักไว้ก่อน (ผู้ใช้ตัดสินใจแล้ว):**
- **ยังไม่ตั้ง pm2/nohup** — ผู้ใช้ต้องขออนุญาตอาจารย์ก่อน เพราะเป็นเซิร์ฟเวอร์ของมหาวิทยาลัย
  (ปล่อย process รันค้างตลอดเวลาโดยไม่ขอก่อนไม่เหมาะสม)
- **ระหว่างนี้:** ทดสอบ/พัฒนาด้วยการเปิด SSH terminal ค้างไว้ (`node server.js`) เฉยๆ พอ
  ปิด SSH เมื่อไหร่ API จะหยุดทำงาน — ต้องเปิดใหม่ก่อนทดสอบทุกครั้ง
- อย่าเสนอ/ทำ pm2 ให้เองอีกจนกว่าผู้ใช้จะแจ้งว่าอาจารย์อนุญาตแล้ว

**API_BASE_URL ใช้งานได้จริงแล้ว:** `http://119.59.102.161:3059/api` (ตั้งไว้ใน `src/config.ts` แล้ว)

## ✅ PART B — เชื่อม Frontend เข้ากับ API จริง (เขียนโค้ดเสร็จแล้ว — `tsc --noEmit` ผ่าน 0 error)

**⚠️ ยังไม่ได้ทดสอบจริงบนแอป** (ต้องเปิด SSH รัน `node server.js` ค้างไว้ก่อนถึงจะเทสต์ได้ — ดูหัวข้อ pm2 ด้านบน)
สิ่งที่ต้องทดสอบก่อนถือว่า PART B เสร็จจริง: สมัคร/ล็อกอินจากแอป, กดหัวใจ/เพิ่มตะกร้าแล้ว refresh ไม่หาย,
สินค้าบนหน้า Home ดึงจาก MySQL จริง (ไม่ใช่ fallback), ปุ่ม "ออกจากระบบ" ทำงาน

### ไฟล์ที่สร้างใหม่
| ไฟล์ | หน้าที่ |
|------|---------|
| `src/api/client.ts` | fetch wrapper — แนบ `Authorization: Bearer <token>`, throw `ApiError` พร้อม message ไทยจาก server |
| `src/api/auth.ts` | `authApi.register/login/me` |
| `src/api/catalog.ts` | `catalogApi.listProducts/listCategories` (ใช้ใน catalog-store) |
| `src/api/cart.ts` | `cartApi.get/addItem/updateItem/removeItem/setAllSelected` |
| `src/api/favorites.ts` | `favoritesApi.get/toggle` |
| `src/utils/secure-storage.ts` | เก็บ JWT — `expo-secure-store` บน native, `localStorage` บนเว็บ (SecureStore ไม่รองรับเว็บ) |
| `src/store/auth-store.tsx` | `AuthProvider` + `useAuth()` — restore session ตอนเปิดแอป, `login/register/logout` |
| `src/app/(auth)/_layout.tsx`, `login.tsx`, `register.tsx` | หน้าเข้าสู่ระบบ/สมัครสมาชิก ตาม design system เดิม |
| `src/components/shop/require-auth.tsx` | guard component — โชว์ prompt "เข้าสู่ระบบ" ถ้ายังไม่ล็อกอิน ใช้ครอบ cart/favorites/profile |

### ไฟล์ที่แก้
| ไฟล์ | เปลี่ยนอะไร |
|------|-------------|
| `src/app/_layout.tsx` | เพิ่ม `AuthProvider` (นอกสุด) + register `(auth)` ใน `<Stack>` |
| `src/store/catalog-store.tsx` | fallback chain ใหม่: **API → GitHub JSON → bundled JSON** · เปลี่ยน `isRemote: boolean` → `source: 'api'\|'github'\|'bundled'` · เพิ่ม `refresh()` |
| `src/store/shop-store.tsx` | **ลบ seed hardcode (`p1`,`p3`,`p2`,`p5`) ออกแล้ว** · เมื่อล็อกอิน: ดึง cart/favorites จาก server มา hydrate เป็น `Product` เต็มด้วย `getProductById` จาก catalog-store · ทุก mutation (addToCart ฯลฯ) เป็น optimistic local update + ยิง API แบบ fire-and-forget (ไม่ revert ถ้า error) |
| `src/app/(tabs)/cart.tsx` | 🐛 **แก้บั๊กรูปแล้ว** (`SkeletonImage` ส่ง `uri={item.product.images[0]}`) + ครอบด้วย `RequireAuth` |
| `src/app/(tabs)/favorites.tsx` | ครอบด้วย `RequireAuth` |
| `src/app/(tabs)/profile.tsx` | ครอบด้วย `RequireAuth` · เลิก hardcode ชื่อ/อีเมล ใช้ `useAuth().user` จริง · เพิ่มปุ่ม "ออกจากระบบ" |
| `app.json` | เพิ่ม plugin `expo-build-properties` ตั้ง `android.usesCleartextTraffic: true` (API เป็น `http://` ไม่ใช่ https) |

### ⚠️ ข้อจำกัดที่รู้อยู่ (ไม่ใช่บั๊ก แต่ควรรู้)
- **guest cart ไม่ merge ตอน login** — ถ้าไม่ได้ล็อกอินแล้วกด "เพิ่มลงตะกร้า" (ทำได้ที่หน้า product detail
  เพราะหน้านั้นไม่ได้ gate ด้วย RequireAuth) พอ login ทีหลัง local cart จะถูก**ทับ**ด้วย cart จาก server
  (ของเดิมที่เพิ่มตอนเป็น guest จะหาย) — ยอมรับได้สำหรับ scope นี้ ยังไม่ทำ merge logic
- **ไม่มี merge/retry ถ้า sync API พลาด** — mutation ยิงแบบ fire-and-forget เฉยๆ (`.catch(() => {})`)
  ถ้าอยากทำ retry/rollback ค่อยทำใน Part D (production hardening)
- **iOS ไม่ได้ตั้ง ATS exception** — ตั้งแค่ Android (`usesCleartextTraffic`) เพราะโปรเจกต์นี้เทสต์บน
  web/Android เป็นหลัก ถ้าต้องรันบน iOS จริงต้องเพิ่ม `NSAppTransportSecurity` exception ด้วย

### ขั้นต่อไป → PART C (ทำให้ปุ่มที่เหลือใช้งานได้จริง — ดูรายละเอียดเต็มใน `Phase1.md`)
1. **ทดสอบ PART B ก่อน** (สมัคร/ล็อกอินจากแอปจริง ผ่าน browser ที่ `npx expo start --web`)
2. ค้นหาสินค้าจริง (`src/app/search.tsx`)
3. ตัวกรองขั้นสูง (`filter-sheet.tsx`)
4. Checkout flow: `checkout/address.tsx` → `summary.tsx` → `success.tsx` (ต้องเขียน `src/api/orders.ts`,
   `src/api/addresses.ts` เพิ่ม — ยังไม่มี)
5. เมนูโปรไฟล์ที่เหลือ: คำสั่งซื้อ, ที่อยู่จัดส่ง, คูปอง, ตั้งค่า, แจ้งเตือน
6. ปุ่ม share, ปุ่ม info ผ่อนชำระ

### 🖥️ ข้อมูลเซิร์ฟเวอร์ (ทดสอบ port แล้ว — อย่าทดสอบซ้ำ)

| รายการ | ค่า |
|--------|-----|
| SSH | `ssh std6730202645@119.59.102.161 -p 2222` · port 2222 🟢 เปิด |
| Workspace | **`/app`** ← เขียน backend ที่นี่ |
| Stack | **Node + Express + mysql2 + bcrypt + jsonwebtoken + dotenv** |
| Database | **`ip_std6730202645`** · MySQL 8.0.46 · `utf8mb4_unicode_ci` |
| MySQL user | `std6730202645@localhost` |
| phpMyAdmin | http://119.59.102.161/nindamdb |
| รหัสผ่าน | http://nindam.ddns.net/web/ |
| **Assigned backend port** | ✅ **`3059`** (ยืนยันจากข้อความตอน SSH login) |
| Port 3306 | 🔴 ปิดจากภายนอก (จึงต้องรัน Node บนเซิร์ฟเวอร์) |

- `server/.env.example` ใส่ `PORT=3059` และ **JWT_SECRET สุ่มไว้ให้แล้ว** (ใช้ได้เลย)
  เหลือแค่กรอก `DB_PASSWORD` เอง (ดูที่ nindam.ddns.net/web/)
- `src/config.ts` เพิ่ม `API_BASE_URL = 'http://119.59.102.161:3059/api'` ไว้ล่วงหน้าแล้ว
  (ยังไม่ถูกใช้งานจริงจนกว่าจะเขียน `src/api/client.ts` ใน PART B)
- ⚠️ เจอปัญหา SSH connection reset ระหว่างพิมพ์คำสั่ง (`cd /app` แล้วหลุด) — น่าจะเป็น idle timeout
  ของเซิร์ฟเวอร์ปกติ วิธีแก้: reconnect ใหม่แล้วพิมพ์คำสั่งต่อเนื่องไม่ทิ้งช่วงนาน

**สรุปสถาปัตยกรรม:** `Expo App ──HTTP :30xx──► Express (บน /app) ──localhost:3306──► MySQL`

⚠️ ห้ามใช้ MongoDB · ห้ามรัน Express บนเครื่องเราแล้วต่อ MySQL ปลายทาง (port ปิด)
⚠️ `server.js` ต้อง `listen(PORT, '0.0.0.0')` และใช้ Assigned port เท่านั้น

### ลำดับงาน Phase 2 (รายละเอียดเต็มใน `Phase1.md`)
1. 🐛 แก้บั๊กรูปในตะกร้า → 2. รัน `schema.sql`+`seed.sql` ใน phpMyAdmin →
3. SSH เข้า `/app` + npm install + **จด Assigned port** → 4. `server.js`+`db.js`+products API →
5. Auth + `auth-store` + หน้า login → 6. แก้ `catalog-store` ให้ยิง API →
7. Cart/Favorites sync → 8. Checkout + Orders → 9. Search + Filter →
10. Notifications/Settings/Coupons + Share + hardening

---

## 📁 ไฟล์เอกสารในโปรเจกต์

| ไฟล์ | คืออะไร |
|------|---------|
| `AGENTS.md` | กฎการทำงาน (โหลดอัตโนมัติทุก session ผ่าน `CLAUDE.md`) |
| `PROGRESS.md` | ไฟล์นี้ — บันทึกความคืบหน้า |
| `Phase1_UI_prompt.md` | โจทย์ตั้งต้น Phase 1 (UI) — ทำเสร็จแล้ว |
| `Phase1.md` | แผน Phase 2 (backend + ทำให้ใช้งานได้จริง) — ยังไม่เริ่ม |
| `รายงาน_3ส่วนUI.md` | เอกสารประกอบรายงานส่งอาจารย์ (Header / Detail / Bottom Tab) |
| `DEMO_fetch_github.ts` | ⚠️ ไฟล์ชั่วคราวไว้แคปรายงาน — **ลบได้เมื่อแคปเสร็จ** |
| `.claude/skills/chaje-shop/SKILL.md` | คู่มือละเอียด + API ของ component ทุกตัว |

---

## วิธีอัปเดตไฟล์นี้ (สำหรับ AI)

ทำงานเสร็จแต่ละก้อนให้แก้ 4 จุด:
1. **วันที่ + สถานะรวม** บนหัวไฟล์
2. ย้ายรายการจาก **❌ ยังไม่ได้ทำ** → **✅ เสร็จแล้ว** พร้อมระบุไฟล์ที่แตะ
3. ถ้าเจอบั๊กใหม่ → เพิ่มในตาราง 🐛 พร้อม **ไฟล์ + เลขบรรทัด**
4. ถ้าสร้าง component/store/หน้าใหม่ → เพิ่มชื่อลงรายการให้ครบ

**เขียนให้สั้น กระชับ แต่ระบุ path + เลขบรรทัดเสมอ** เป้าหมายคือ session หน้าอ่านไฟล์นี้จบแล้ว
ลงมือทำงานต่อได้เลยโดยไม่ต้อง `grep` หรือเปิดไฟล์สำรวจ
