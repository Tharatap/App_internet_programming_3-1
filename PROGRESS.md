# PROGRESS — บันทึกความคืบหน้า

> **สำหรับ AI:** อ่านไฟล์นี้ก่อนเริ่มงานเสมอ เพื่อไม่ต้องสำรวจโค้ดซ้ำ (ประหยัด token)
> **ทำงานเสร็จแต่ละก้อน → กลับมาอัปเดตไฟล์นี้ทันที** (ดูวิธีอัปเดตท้ายไฟล์)

**อัปเดตล่าสุด:** 2026-08-06 · **สถานะรวม:** Phase 1 เสร็จ 100% · Phase 2: PART A (backend) ✅ deploy สำเร็จ+ทดสอบผ่านหมด ·
PART B (auth+เชื่อม API) ✅ เขียนเสร็จ+**ทดสอบผ่านจริงจากเบราว์เซอร์แล้ว** (login ใช้งานได้) ·
PART C (ทำให้ปุ่มที่เหลือใช้งานได้จริง) ✅ เขียนเสร็จ ยังไม่ทดสอบครบทุก flow ·
🎨 **Pixel Theme Reskin** ✅ เขียนเสร็จทั้งแอป ผ่าน typecheck 0 error + bundle สำเร็จ + **เปิดดูจริงบนเบราว์เซอร์แล้ว ผ่าน** (2026-08-06) ·
🛠️ **แอดมิน: เพิ่ม/แก้ไข/ลบสินค้า** ✅ เขียนเสร็จ `tsc --noEmit` ผ่าน 0 error ยังไม่ได้ทดสอบจริง (ต้องรัน SQL + deploy backend ก่อน)

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
- ~~guest cart ไม่ merge ตอน login~~ ✅ **แก้แล้ว** — ดูหัวข้อ "🔧 แก้ข้อจำกัด 3 ข้อ" ด้านล่าง
- ~~ไม่มี retry/rollback ถ้า sync API พลาด~~ ✅ **แก้แล้ว** — ดูหัวข้อ "🔧 แก้ข้อจำกัด 3 ข้อ" ด้านล่าง
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
| คูปอง | `src/app/coupons.tsx` | list + เลือกเข้า checkout ได้แล้ว (ดูหัวข้อ "🔧 แก้ข้อจำกัด 3 ข้อ") |
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
- ~~คูปองยังไม่ผูกเข้า checkout จริง~~ ✅ **แก้แล้ว** — ดูหัวข้อ "🔧 แก้ข้อจำกัด 3 ข้อ" ด้านล่าง
- **ค่าส่งคำนวณฝั่ง client เป็นการประมาณ** ก่อนกดยืนยัน (เพื่อโชว์ preview) แต่**ยอดจริงคำนวณใหม่ฝั่ง server เสมอ** ตอน `POST /api/orders` (ตามกฎ A6 ใน `Phase1.md`) — สองฝั่งใช้สูตรเดียวกัน (subtotal≥500 ฟรี ไม่งั้น 50, ส่วนลดคูปอง) จึงตรงกัน แต่ถ้าเปลี่ยนกฎค่าส่งต้องแก้ทั้ง 2 ที่
- **ธีม/ภาษาในหน้าตั้งค่าเป็น cosmetic** — บันทึกลง server แต่ไม่เปลี่ยนหน้าตาแอปจริง (ตั้งใจ ตาม comment เดิมใน `theme.ts` ว่า shop UI เป็น light theme เสมอ)
- ~~guest cart ไม่ merge ตอน login~~ ✅ **แก้แล้ว** — ดูหัวข้อ "🔧 แก้ข้อจำกัด 3 ข้อ" ด้านล่าง

### ขั้นต่อไป → ทดสอบให้ครบ แล้วไป PART D (production hardening)
1. **ต้องทดสอบ PART B + C ทั้งหมดก่อน** — เปิด SSH รัน `node server.js` ค้างไว้ → `npx expo start --web`
   → เดิน flow เต็ม: สมัคร → ค้นหา → กรอง → เพิ่มตะกร้า → เพิ่มที่อยู่ → checkout → ดูคำสั่งซื้อ → แจ้งเตือน → ตั้งค่า → ออกจากระบบ
2. Part D ใน `Phase1.md`: error boundary, offline banner, pull-to-refresh, pagination

---

## 🔧 แก้ข้อจำกัด 3 ข้อ (2026-08-06) — เขียนโค้ดเสร็จแล้ว `tsc --noEmit` ผ่าน 0 error

**⚠️ ยังไม่ได้ทดสอบจริงบนแอป** — ต้องเปิด SSH รัน `node server.js` ค้างไว้ก่อนถึงจะเทสต์ได้
**⚠️ Fix คูปองต้องรัน SQL เพิ่มก่อนใช้งานจริง** ดูข้อ 3 ด้านล่าง

### 1. Rollback เมื่อ sync cart/favorites ล้มเหลว
`src/store/shop-store.tsx` — ทั้ง 7 mutation (`addToCart`, `removeFromCart`, `setQuantity`,
`toggleCartSelected`, `setAllSelected`, `toggleFavorite`) เปลี่ยนจาก `.catch(() => {})` เฉยๆ
เป็น snapshot state ทั้งก้อนก่อนอัปเดต แล้ว `setCart`/`setFavorites` กลับเป็นค่าเดิม +
`Alert.alert(...)` แจ้งเตือนภาษาไทยถ้า API พัง (ไม่ทำ retry อัตโนมัติ — ตัดสินใจร่วมกับผู้ใช้แล้วว่าเกินขอบเขต)

### 2. Merge guest cart/favorites เข้ากับ server ตอน login
`src/store/shop-store.tsx` บรรทัด ~48-121 (`useEffect` hydrate ตอน authenticated) — ก่อน login
ถ้ามีของใน guest cart/favorites จะไม่ถูกทับอีกต่อไป: เทียบกับ cart บน server ทีละ product,
ถ้าซ้ำกัน**บวกจำนวนรวมกัน (จำกัดไม่เกิน 99)**, ถ้าไม่ซ้ำก็เพิ่มเข้าไปใหม่ ส่วน favorites merge แบบ union
(toggle เฉพาะ id ที่ guest มีแต่ server ยังไม่มี) แล้ว fetch คืนมาอีกรอบก่อน hydrate

### 3. ผูกคูปองเข้า checkout จริง
**Backend** (`server/routes/orders.js`) — `POST /api/orders` รับ `couponCode` เพิ่ม, validate จากตาราง
`coupons` (active + ไม่หมดอายุ + ถึง min spend) แล้ว**คำนวณ `discount` ใหม่ฝั่ง server เสมอ** (ไม่เชื่อ client)
บันทึกลงคอลัมน์ `coupon_code` ใหม่ใน `orders`

**Schema** (`server/sql/schema.sql`) — เพิ่มคอลัมน์ `coupon_code VARCHAR(40) NULL` ในตาราง `orders`
⚠️ **database ที่มีอยู่แล้วต้องรันเองใน phpMyAdmin ก่อนใช้งานจริง:**
```sql
ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(40) NULL AFTER discount;
```

**Frontend:**
- `src/types/shop.ts` / `src/api/orders.ts` — `Order.couponCode`, `ordersApi.create` รับ `couponCode` เพิ่ม
- `src/app/coupons.tsx` — เพิ่มโหมด "เลือก" เมื่อเปิดมาจาก checkout (มี query param `addressId`):
  แต่ละแถวกดเลือกได้ (`PressableScale`) + ตัวเลือก "ไม่ใช้คูปอง" ส่งกลับไปหน้า summary ผ่าน query param
- `src/app/checkout/summary.tsx` — เพิ่มแถว "เลือกคูปองส่วนลด" (นำไปหน้า `/coupons?addressId=...`)
  + แถวส่วนลดใน SUMMARY panel (client-side preview เท่านั้น ยอดจริง server คำนวณใหม่ตอนยืนยัน) +
  ส่ง `couponCode` ไปกับ `ordersApi.create`

### ขั้นต่อไป
ต้องรัน `ALTER TABLE` ข้างบนใน phpMyAdmin ก่อน + deploy `server/routes/orders.js` ใหม่ขึ้นเซิร์ฟเวอร์
แล้วเดิน flow เทสต์: เพิ่มของ guest ลงตะกร้า → login เช็คว่า merge ไม่หาย → checkout เลือกคูปอง →
เช็คยอดส่วนลดถูก → ยืนยันคำสั่งซื้อ → เช็ค order มี `discount`/`coupon_code` ถูกต้อง

---

## 🛠️ แอดมิน: เพิ่ม/แก้ไข/ลบสินค้า (2026-08-06) — เขียนโค้ดเสร็จแล้ว `tsc --noEmit` ผ่าน 0 error

**⚠️ ยังไม่ได้ทดสอบจริงบนแอป** — ต้องรัน SQL เพิ่ม + deploy backend ก่อน (ดูข้อ "ขั้นต่อไป" ด้านล่าง)

ก่อนหน้านี้สินค้าในแอปเป็น read-only ทั้งหมด — เพิ่มความสามารถให้ **แอดมินเท่านั้น** เพิ่ม/แก้ไขสินค้าได้
ผ่านหน้าใหม่แยก `/admin/*` รูปภาพกรอกเป็น URL (ไม่ทำ image upload)

### Schema — เพิ่ม role แอดมิน
`server/sql/schema.sql` — เพิ่มคอลัมน์ `is_admin TINYINT(1) NOT NULL DEFAULT 0` ในตาราง `users`
⚠️ **database ที่มีอยู่แล้วต้องรันเองใน phpMyAdmin ก่อนใช้งานจริง:**
```sql
ALTER TABLE users ADD COLUMN is_admin TINYINT(1) NOT NULL DEFAULT 0 AFTER notify_promo;
UPDATE users SET is_admin = 1 WHERE email = '<อีเมลแอดมินคนแรก>';
```

### Backend
- `server/middleware/admin.js` (ใหม่) — `adminOnly` middleware รันต่อจาก `auth`, เช็ค `is_admin` สดจาก DB ทุกครั้ง
  (ไม่ฝังใน JWT เพราะอยากให้เปลี่ยน role มีผลทันทีไม่ต้อง login ใหม่)
- `server/routes/auth.js` — `toUserJson()` ส่ง `isAdmin` กลับมาด้วยแล้ว
- `server/routes/products.js` — เพิ่ม `POST /` (สร้างสินค้าใหม่ id เป็น `` `p${Date.now()}` ``) และ
  `PUT /:id` (แก้ไข) ทั้งคู่ gate ด้วย `auth, adminOnly` — เขียน `product_images`/`product_branch_stock`
  แบบ DELETE ทั้งชุดแล้ว INSERT ใหม่ตามที่ส่งมา ห่อ transaction ทั้งคู่

### Frontend
| ไฟล์ | หน้าที่ |
|------|---------|
| `src/api/auth.ts` | `ApiUser.isAdmin: boolean` |
| `src/types/product.ts` | `ProductInput` — fields ที่ฟอร์มแก้ไขได้ (ตัด id/rating/reviewCount ที่ระบบจัดการเอง) |
| `src/api/catalog.ts` | `createProduct`/`updateProduct` |
| `src/api/client.ts` | เพิ่ม `'PUT'` ใน `RequestOptions.method` |
| `src/components/shop/admin-guard.tsx` (ใหม่) | ต่อยอด `RequireAuth` เพิ่มเช็ค `user?.isAdmin` |
| `src/app/admin/products.tsx` (ใหม่) | list สินค้าทั้งหมด (ใช้ `useCatalog().products` ที่โหลดมาแล้ว) + ปุ่มเพิ่มสินค้าใหม่ |
| `src/app/admin/product-form.tsx` (ใหม่) | ฟอร์มเดียวใช้ทั้งเพิ่ม/แก้ไข (pattern เดียวกับ `addresses/edit.tsx`) — รวมช่องกรอกสต๊อกสาขาแบบเพิ่ม/ลบแถวได้เอง |
| `src/app/(tabs)/profile.tsx` | เมนู "จัดการสินค้า" **แสดงเฉพาะ `user?.isAdmin`** |
| `src/app/_layout.tsx` | register `admin/products`, `admin/product-form` |

⚠️ **หมายเหตุ route naming:** ใช้ `admin/products.tsx` + `admin/product-form.tsx` (แบนราบ 2 segment)
แทนที่จะซ้อน `admin/products/index.tsx` + `admin/products/form.tsx` (3 segment) — เจอปัญหาจริงว่า Expo
Router typed-routes codegen (`.expo/types/router.d.ts`) ไม่ยอมรวม route ที่ซ้อนลึก 3 ชั้นตอนรัน
`npx expo export` (ต้องรัน `npx expo start` เต็มรูปแบบถึงจะ regenerate ให้ครบ) — โครงสร้างแบนช่วยเลี่ยงปัญหานี้

### ลบสินค้า (type-to-confirm) — เพิ่มต่อ (2026-08-06)
กันแอดมินกดลบพลาด — ต้อง**พิมพ์ข้อความคงที่ `Confirm Delete` ให้ตรงเป๊ะ** (case-sensitive) ปุ่มลบถึงจะกดได้
ปุ่มลบมีทั้งที่หน้าลิสต์ (ไอคอนถังขยะต่อแถว) และหน้าฟอร์มแก้ไข (ปุ่มแดงท้ายฟอร์ม เฉพาะโหมดแก้ไข)

- `server/routes/products.js` — เพิ่ม `DELETE /:id` (`auth, adminOnly`, ห่อ transaction) ลบแถวที่อ้างอิง
  สินค้านี้ก่อน (`cart_items`, `favorites`, `product_images`, `product_branch_stock`) แล้วค่อยลบ `products`
  — **ไม่แตะ `order_items`** เพราะเป็น snapshot ประวัติคำสั่งซื้อ ต้องอยู่ต่อแม้สินค้าต้นทางถูกลบ
- `src/api/catalog.ts` — เพิ่ม `deleteProduct(token, id)`
- `src/components/shop/delete-confirm-modal.tsx` (ใหม่) — modal ยืนยันแบบพิมพ์ข้อความ ใช้ร่วมกันทั้ง 2 หน้า
  (โครงเดียวกับ modal ผ่อนชำระใน `src/app/product/[id].tsx`)
- `src/app/admin/products.tsx` — เพิ่มไอคอนถังขยะต่อแถว (แยก `PressableScale` จากปุ่มแก้ไข ไม่ทับ event กัน)
- `src/app/admin/product-form.tsx` — เพิ่มปุ่ม "ลบสินค้า" ท้ายฟอร์ม (เฉพาะโหมดแก้ไข) ลบสำเร็จแล้ว
  `router.replace('/admin/products')` กลับไปหน้าลิสต์ (ไม่ใช้ `back()` เพราะสินค้าที่ฟอร์มอ้างอิงไม่มีอยู่แล้ว)

### ขั้นต่อไป
1. รัน SQL ด้านบนใน phpMyAdmin (เพิ่มคอลัมน์ + ตั้งแอดมินคนแรก)
2. Deploy `server/` ที่แก้แล้วขึ้นเซิร์ฟเวอร์อาจารย์ (ไฟล์ใหม่ `middleware/admin.js` ต้องอัปโหลดด้วย)
   แล้วรัน `node server.js` ค้างไว้
3. ทดสอบ: login ด้วยบัญชีแอดมิน → เห็นเมนู "จัดการสินค้า" (บัญชีทั่วไปต้องไม่เห็น) → เพิ่ม/แก้ไขสินค้า →
   เช็คว่าอัปเดตทุกที่ที่แสดงสินค้านั้นจริง → เช็ค negative case (ยิง `POST /api/products` ด้วย token
   ที่ไม่ใช่แอดมินต้องได้ 403)
4. ทดสอบลบสินค้า: กดถังขยะ/ปุ่มลบ → ปุ่มยืนยันต้อง disabled จนพิมพ์ `Confirm Delete` ตรงเป๊ะ → ลบสำเร็จ
   แล้วเช็คว่าออร์เดอร์เก่าที่เคยมีสินค้านี้ยังดูรายละเอียดได้ปกติ (ไม่หายไปด้วย)

---

## 🎨 Pixel Theme Reskin — ธีม "cozy pixel game" (เขียนเสร็จทั้งแอปแล้ว)

แปลงดีไซน์จากไฟล์ที่ export มาจาก Claude Design (`16-bit pixel theme conversion/Pixel Appliance Shop.dc.html`)
เป็นโค้ด React Native จริง **ครอบคลุมทั้งแอป** ไม่ใช่แค่ 5 หน้าตัวอย่าง เพราะ shared component/theme
ถูกรีสกินแล้วทุกหน้าที่เหลือ (search, addresses, orders, coupons, settings, notifications, login/register)
จึงได้หน้าตาใหม่อัตโนมัติตามไปด้วย

**สถานะ:** `tsc --noEmit` ผ่าน 0 error · bundle สำเร็จ (3253 modules, ไม่มี error runtime) ·
✅ **เปิดดูจริงบนเบราว์เซอร์แล้ว (2026-08-06) — ผ่าน** ฟอนต์/สี/pixel-shadow ตามที่คาด

### ขอบเขตที่ตกลงกันไว้
- ระบบเหรียญ/เลเวล/เควส (gamification) ที่เห็นในดีไซน์ต้นฉบับ = **แสดงหน้าตาอย่างเดียว ไม่มี backend จริง**
  (ตัวเลขในหน้าโปรไฟล์เป็นค่า placeholder ตายตัว ยกเว้น "รายการโปรด" ที่ดึงจากข้อมูลจริง)
- Reskin ครบทั้ง 5 หน้าที่มีดีไซน์ต้นแบบ: Home, รายละเอียดสินค้า, ตะกร้า, Checkout, โปรไฟล์

### ไฟล์ใหม่
| ไฟล์ | หน้าที่ |
|------|---------|
| `src/components/shop/pixel-panel.tsx` | แผงสถิตย์ (ไม่กด) มีเส้นขอบหนา + เงาทึบ (hard offset shadow) — ใช้กับการ์ดราคา, สรุปยอด, ที่อยู่ ฯลฯ |

### Design tokens (`src/constants/theme.ts`) — เขียนใหม่ทั้งไฟล์
- `Brand` พาเลตใหม่: พื้นหลังครีมอุ่น `#FDF3DC`, การ์ด `#FFFDF5`, เขียวมะนาว CTA เดิม `#D6F26A` (คงไว้),
  เพิ่ม `skyBlue`/`saleBg`/`coin`/`mint`/`tan` สำหรับพื้นหลังแต่ละส่วน
- `Radius` = 0 ทั้งหมด (ธีมพิกเซลใช้มุมฉาก ไม่มีมุมโค้ง) — cascade อัตโนมัติไปทุกที่ที่ใช้ `Radius.xxx` เดิม
- `PixelFonts` ฟอนต์ใหม่ 3 ตระกูล (ผ่าน `@expo-google-fonts/*`, โหลดใน root `_layout.tsx` ด้วย `useFonts`):
  - `pixel` (Press Start 2P) — ราคา/หัวข้อเน้น (รองรับแค่ละติน/ตัวเลข)
  - `heading*` (Kanit 400-700) — หัวข้อ/ปุ่มภาษาไทย
  - `body*` (Noto Sans Thai 400-600) — เนื้อหา/คำอธิบาย
- `PixelBorder` (thin/base/thick = 2/3/4px), `PixelShadow` (sm/md/lg = 3/5/8px)
- `CategoryPalette` สีพาสเทล 5 สีหมุนใช้กับ chip หมวดหมู่

### `PressableScale` (ต่อยอดของเดิม ไม่ใช่ไฟล์ใหม่)
เพิ่ม prop `pixelShadow?: number` — เมื่อใส่ค่า จะเรนเดอร์เงาทึบสี่เหลี่ยมชิดหลัง (แทน CSS `box-shadow` ที่ RN ไม่รองรับ)
แล้วปุ่มจะ **"ยุบ" ทับเงาตอนกด** (translateX/Y เท่ากับระยะเงา) เลียนแบบปุ่มเกม 16-bit —
ถ้าไม่ใส่ `pixelShadow` จะทำงานเหมือนเดิมทุกอย่าง (แค่ scale ตอนกด) ไม่กระทบโค้ดเก่าที่เรียกใช้แบบเดิม

### Component ที่ reskin (คนละไฟล์ ไม่ได้สร้างใหม่)
`icon-button.tsx` (วงกลม→สี่เหลี่ยมพิกเซล) · `badge.tsx` (สี่เหลี่ยมขอบหนา ฟอนต์ Kanit) ·
`checkbox.tsx` · `quantity-stepper.tsx` · `heart-button.tsx` (วงกลม→สี่เหลี่ยม) ·
`skeleton-image.tsx` (เพิ่มขอบพิกเซล) · `category-icon.tsx` (เพิ่ม prop `paletteIndex` หมุนสีพื้น) ·
`section-header.tsx` · `top-bar.tsx` (พื้นหลังฟ้าพาสเทล + ขอบหนาด้านล่าง ทั้ง 2 variant) ·
`product-card.tsx` (ขอบ+เงาพิกเซล) · `address-card.tsx`

### หน้าจอที่ reskin ทั้งหมด (5 หน้าตามดีไซน์ต้นแบบ)
`(tabs)/index.tsx` (Home — promo banner สีมิ้นท์, flash-sale panel สีชมพู "FLASH QUEST") ·
`product/[id].tsx` (เพิ่ม energy bar 5 ช่องแบบมิเตอร์เกม) · `(tabs)/cart.tsx` ·
`checkout/address.tsx` + `summary.tsx` + `success.tsx` · `(tabs)/profile.tsx` (เพิ่ม stat tile แถวบน)
+ `(tabs)/_layout.tsx` (bottom tab bar พื้น/ขอบ/ฟอนต์ใหม่)

### 🐛 บั๊กที่เจอระหว่างทางและแก้แล้ว
- `src/app/(tabs)/cart.tsx` — ปุ่ม "ชำระเงิน" มีฟังก์ชัน `onCheckout` แต่**ลืมผูก `onPress`** เข้ากับปุ่ม
  (กดแล้วไม่มีอะไรเกิดขึ้นเลย) — แก้แล้ว

### ⚠️ ข้อควรรู้ / จุดที่ประนีประนอมไว้ (ไม่ใช่บั๊ก)
- **ไอคอนหมวดหมู่ยังใช้ `lucide-react-native`** (เส้น outline) ไม่ใช่ pixel art จริง — วางบน chip พื้นสีพาสเทล
  ขอบหนาแทน เพื่อไม่ต้องวาด/หา asset ไอคอนพิกเซลใหม่ทั้งชุด (นอกขอบเขตที่ตกลงไว้)
- **ลวดลาย diagonal stripe บนพื้นรูปสินค้าในดีไซน์ต้นฉบับ (CSS `repeating-linear-gradient`) ไม่ได้ทำ** —
  ใช้พื้นสีเรียบแทน (`Brand.surfaceDeep`) เพราะ RN ทำลายเส้นทแยงแบบ CSS ไม่ได้ตรงๆ ต้องใช้ SVG pattern เพิ่ม
- **มาสคอต "พลั๊กกี้" ในดีไซน์ต้นฉบับไม่ได้ทำ** — เป็นภาพประกอบเคลื่อนไหว (bob/blink animation) ต้องวาด
  asset เอง ไม่ได้อยู่ใน scope นี้
- **Press Start 2P ไม่รองรับตัวอักษรไทย** — ใช้เฉพาะกับตัวเลข/คำภาษาอังกฤษสั้นๆ (ราคา, ปุ่ม "CHECKOUT", ป้าย)
  ส่วนข้อความไทยทั้งหมดใช้ Kanit/Noto Sans Thai แทน

### ขั้นต่อไป
✅ ทดสอบจริงบนเบราว์เซอร์แล้ว — ผ่าน (2026-08-06) ยังไม่ได้ทดสอบบนมือถือจริง

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
