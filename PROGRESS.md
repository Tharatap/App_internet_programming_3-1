# PROGRESS — บันทึกความคืบหน้า

> **สำหรับ AI:** อ่านไฟล์นี้ก่อนเริ่มงานเสมอ เพื่อไม่ต้องสำรวจโค้ดซ้ำ (ประหยัด token)
> **ทำงานเสร็จแต่ละก้อน → กลับมาอัปเดตไฟล์นี้ทันที** (ดูวิธีอัปเดตท้ายไฟล์)

**อัปเดตล่าสุด:** 2026-07-27 · **สถานะรวม:** Phase 1 เสร็จ 100% · Phase 2: PART A (backend) ✅ deploy สำเร็จ+ทดสอบผ่านหมด ·
PART B (auth+เชื่อม API) ✅ เขียนเสร็จ · PART C (ทำให้ปุ่มที่เหลือใช้งานได้จริง) ✅ เขียนเสร็จ ผ่าน typecheck 0 error ·
**ยังไม่ได้ทดสอบจริงบนมือถือ/เว็บทั้ง PART B และ C** (ต้องเปิด SSH รัน `node server.js` ค้างไว้ก่อนถึงจะเทสต์ได้)

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

## ✅ PART C — ทำให้ปุ่มที่เหลือทั้งหมดใช้งานได้จริง (เขียนโค้ดเสร็จแล้ว — `tsc --noEmit` ผ่าน 0 error)

**⚠️ ยังไม่ได้ทดสอบจริงบนแอป** เช่นเดียวกับ PART B — ต้องเปิด SSH รัน `node server.js` ค้างไว้ก่อน
ไม่มี `onPress={() => {}}` เหลืออยู่ในโค้ดแล้ว (เช็คด้วย grep แล้ว)

### ไฟล์ใหม่ — types + API modules
| ไฟล์ | หน้าที่ |
|------|---------|
| `src/types/shop.ts` | `Address`, `AddressInput`, `Order`, `OrderItem`, `OrderStatus`, `AppNotification`, `Coupon` |
| `src/api/addresses.ts` | list/create/update/remove |
| `src/api/orders.ts` | create (checkout) / list / detail |
| `src/api/notifications.ts` | list / markRead |
| `src/api/coupons.ts` | list |
| `src/api/users.ts` | updateSettings (theme/language/notifyPromo) |
| `src/utils/search-history.ts` | ประวัติค้นหา — **ใช้ `secureStorage` เดิมซ้ำ** ไม่ได้เพิ่ม AsyncStorage dependency ใหม่ |

### ไฟล์ใหม่ — component ใช้ซ้ำ
| ไฟล์ | หน้าที่ |
|------|---------|
| `src/components/shop/filter-sheet.tsx` | bottom sheet ตัวกรอง: ยี่ห้อ/ช่วงราคา/เบอร์ประหยัดไฟ/สต๊อก — กรอง**ฝั่ง client**ทั้งหมด (ไม่ยิง API ใหม่ เพราะ catalog แค่ 12 ชิ้นโหลดมาหมดแล้วผ่าน catalog-store) |
| `src/components/shop/address-card.tsx` | การ์ดที่อยู่ ใช้ทั้งหน้า checkout (โหมดเลือก) และหน้าจัดการที่อยู่ (โหมด edit/delete) |

### ไฟล์ใหม่ — หน้าจอ
| หน้า | ไฟล์ | หมายเหตุ |
|------|------|----------|
| ค้นหา | `src/app/search.tsx` | กรอง**ฝั่ง client**จาก `useCatalog().products` (ชื่อ/คำอธิบาย/ยี่ห้อ) debounce 300ms + ประวัติค้นหา |
| ที่อยู่จัดส่ง (จัดการ) | `src/app/addresses/index.tsx` + `edit.tsx` | list + เพิ่ม/แก้/ลบ/ตั้งค่าเริ่มต้น |
| Checkout | `src/app/checkout/_layout.tsx`, `address.tsx`, `summary.tsx`, `success.tsx` | ครบ flow: เลือกที่อยู่ → สรุป (คำนวณค่าส่งฝั่ง client แบบเดียวกับ server: subtotal≥500 ฟรี ไม่งั้น 50) → ยืนยัน (`ordersApi.create`) → สำเร็จ |
| คำสั่งซื้อ | `src/app/orders/index.tsx` + `[id].tsx` | list + รายละเอียด พร้อม status badge (5 สถานะ) |
| คูปอง | `src/app/coupons.tsx` | list อย่างเดียว (**ยังไม่ได้ผูกเข้ากับ checkout** — ดูข้อจำกัดด้านล่าง) |
| ตั้งค่า | `src/app/settings.tsx` | ธีม/ภาษา (เก็บฝั่ง server ผ่าน `usersApi`, ไม่ได้เปลี่ยนหน้าตาแอปจริงเพราะ design system ตั้งใจให้ shop เป็น light theme เสมอ) + แจ้งเตือนโปรโมชัน + ล้างแคชค้นหา + ออกจากระบบ |
| แจ้งเตือน | `src/app/notifications.tsx` | list + tap เพื่อ mark read |

### ไฟล์ที่แก้ (wire ปุ่มที่มีอยู่แล้ว)
| ไฟล์ | เปลี่ยนอะไร |
|------|-------------|
| `src/types/product.ts` | เพิ่ม `brand?: string` (optional — bundled/GitHub fallback อาจไม่มี) |
| `src/data/products.json` | เพิ่ม `brand` ให้ครบ 12 ตัว ให้ตรงกับ `server/sql/seed.sql` (Samsung/Electrolux/Philips/Hatari/Sharp) — **หมายเหตุ: ก็อปปี้บน GitHub repo ยังไม่ sync ค่านี้ ต้อง push เองถ้าต้องการ** |
| `src/app/(tabs)/index.tsx` | search bar → `/search` จริง · `onSettings`/`onNotification` → `/settings`, `/notifications` · จุดแดงผูกกับจำนวนแจ้งเตือนที่ยังไม่อ่านจริง (`useFocusEffect` + `notificationsApi.list`) |
| `src/app/products.tsx` | เพิ่มปุ่ม "ตัวกรอง" (chip ท้ายแถว) เปิด `FilterSheet` · `showFilter`/`onFilter` ของ `TopBar` ถูกต่อจริงแล้ว |
| `src/app/(tabs)/cart.tsx` | แถบที่อยู่ → `/addresses` · ปุ่ม "ชำระเงิน" → เช็คมีสินค้าเลือกไหม (ไม่มีจะ Alert เตือน) → `/checkout/address` |
| `src/app/(tabs)/profile.tsx` | เมนู 5 ข้อ wire ครบ: คำสั่งซื้อ→`/orders`, ที่อยู่→`/addresses`, คูปอง→`/coupons`, โปรด→`/(tabs)/favorites`, ตั้งค่า→`/settings` |
| `src/app/product/[id].tsx` | ปุ่ม info → เปิด Modal อธิบายเงื่อนไขผ่อนชำระ (ข้อความ static ไม่ได้ดึงจาก server) · ส่ง `productName` ให้ `FloatingHeader` |
| `src/components/shop/top-bar.tsx` | `FloatingHeader` ปุ่ม share ใช้งานได้จริง: `navigator.share` บนเว็บ (ถ้า browser รองรับ), `Share.share()` ของ RN บนมือถือ — แชร์ deep link `myprofileappnindam://product/{id}` |
| `src/app/_layout.tsx` | register route ใหม่ทั้งหมดใน `<Stack>`: search, settings, notifications, coupons, addresses/*, orders/*, checkout |

### ⚠️ ข้อจำกัดที่รู้อยู่ (ไม่ใช่บั๊ก แต่ควรรู้)
- **คูปองยังไม่ผูกเข้า checkout จริง** — หน้า `/coupons` แสดง list ได้ แต่หน้า checkout summary ยังไม่มีช่องกรอก/เลือกโค้ดส่วนลด (`discount` ใน order ตอนนี้เป็น 0 เสมอ) — ทำเพิ่มได้ทีหลังถ้าต้องการ
- **ค่าส่งคำนวณฝั่ง client เป็นการประมาณ** ก่อนกดยืนยัน (เพื่อโชว์ preview) แต่**ยอดจริงคำนวณใหม่ฝั่ง server เสมอ** ตอน `POST /api/orders` (ตามกฎ A6 ใน `Phase1.md`) — สองฝั่งใช้สูตรเดียวกัน (subtotal≥500 ฟรี ไม่งั้น 50) จึงตรงกัน แต่ถ้าเปลี่ยนกฎค่าส่งต้องแก้ทั้ง 2 ที่
- **ธีม/ภาษาในหน้าตั้งค่าเป็น cosmetic** — บันทึกลง server แต่ไม่เปลี่ยนหน้าตาแอปจริง (ตั้งใจ ตาม comment เดิมใน `theme.ts` ว่า shop UI เป็น light theme เสมอ)
- **guest cart ไม่ merge ตอน login** (จดไว้ตั้งแต่ PART B ยังไม่ได้แก้)

### ขั้นต่อไป → ทดสอบให้ครบ แล้วไป PART D (production hardening)
1. **ต้องทดสอบ PART B + C ทั้งหมดก่อน** — เปิด SSH รัน `node server.js` ค้างไว้ → `npx expo start --web`
   → เดิน flow เต็ม: สมัคร → ค้นหา → กรอง → เพิ่มตะกร้า → เพิ่มที่อยู่ → checkout → ดูคำสั่งซื้อ → แจ้งเตือน → ตั้งค่า → ออกจากระบบ
2. Part D ใน `Phase1.md`: error boundary, offline banner, pull-to-refresh, pagination, ผูกคูปองเข้า checkout จริง

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
- ⚠️ **ยืนยันแล้วว่าเกิดขึ้นจริงระหว่างทดสอบแอปจากเบราว์เซอร์** — SSH หลุด → `node server.js` ตายไปด้วย
  → แอปขึ้น "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้" (เพราะ error ที่รับไม่ใช่ ApiError แต่เป็น fetch ล้มเหลวระดับเน็ตเวิร์ก)
  **นี่คือสาเหตุอันดับ 1 ที่ต้องเช็คก่อนเสมอถ้าแอป error ว่าเชื่อมต่อไม่ได้** — ให้เช็คว่า SSH/`node server.js`
  ยังรันอยู่ไหมก่อนไปหาสาเหตุอื่น (CORS/extension ฯลฯ) จะไม่เสียเวลาไล่ผิดจุด
  → รอ pm2 ได้รับอนุญาตจากอาจารย์ก่อนถึงจะแก้ปัญหานี้ถาวร (ดูหัวข้อด้านบน)

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
