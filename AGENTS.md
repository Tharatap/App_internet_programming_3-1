# Chaje Electric — กฎการทำงานของโปรเจกต์

แอปขายเครื่องใช้ไฟฟ้า · Expo SDK 57 + Expo Router v57 + TypeScript · UI ภาษาไทย

## ⚠️ อ่านก่อนเริ่มทุกครั้ง

1. **`PROGRESS.md`** — อะไรเสร็จแล้ว / อะไรยังไม่เสร็จ **อ่านไฟล์นี้ก่อนเสมอ อย่าสำรวจโค้ดซ้ำ**
2. เมื่อทำงานเสร็จแต่ละก้อน **ต้องอัปเดต `PROGRESS.md`** ทันที (ไม่งั้น session หน้าจะเสียเวลาค้นใหม่)
3. ต้องการรายละเอียด component API / สูตรงานที่ทำบ่อย → เรียก skill **`chaje-shop`**

## Expo HAS CHANGED

อ่าน docs ตามเวอร์ชันที่ https://docs.expo.dev/versions/v57.0.0/ ก่อนเขียนโค้ดที่แตะ Expo API
ติดตั้ง native module ด้วย `npx expo install` เท่านั้น (ห้าม `npm i`)

## กฎเหล็ก

| # | กฎ |
|---|-----|
| 1 | **ห้าม hardcode สี** — ใช้ `Brand` / `Radius` จาก `src/constants/theme.ts` เท่านั้น |
| 2 | **ห้ามเขียน component ใหม่ทับของเดิม** — ต่อยอดจาก `src/components/shop/` (มี 11 ตัวพร้อมใช้) |
| 3 | **ห้ามเขียนฟังก์ชัน format ราคา/เวลาใหม่** — ใช้ `formatBaht()` / `formatCountdown()` จาก `src/utils/format.ts` |
| 4 | ปุ่มที่กดได้ทุกปุ่มใช้ `PressableScale` (ไม่ใช่ `Pressable` เปล่า) |
| 5 | ข้อความ UI ทั้งหมดเป็น **ภาษาไทย** |
| 6 | หน้าใหม่ทุกหน้าต้องมี `TopBar` ให้สอดคล้องกับหน้าเดิม |
| 7 | เสร็จงานต้องรัน `npx tsc --noEmit` ให้ผ่าน **0 error** ก่อนบอกว่าเสร็จ |
| 8 | **ห้าม commit `.env`** หรือค่า secret ใดๆ |

## โครงสร้างที่ต้องรู้

```
src/
├── app/              หน้าจอ (Expo Router) — root คือ src/app ไม่ใช่ app/
│   ├── (tabs)/       5 แท็บ: index(Home), catalog, cart, favorites, profile
│   ├── product/[id]  หน้ารายละเอียดสินค้า
│   └── products.tsx  หน้ารายการสินค้า/ผลค้นหา
├── components/shop/  component ใช้ซ้ำ 11 ตัว ← ดูรายละเอียดใน skill chaje-shop
├── constants/theme.ts  Brand (สี), Radius, AppFrameWidth
├── store/            catalog-store (สินค้า), shop-store (ตะกร้า/โปรด)
├── data/             products.json, categories.json (12 สินค้า / 7 หมวด)
├── types/product.ts  Product, Category, CartItem, BranchStock
└── utils/format.ts   formatBaht, formatCountdown
```

## คำสั่งที่ใช้บ่อย

```bash
npx expo start --web      # รันบนเว็บ (F12 → Ctrl+Shift+M ดูเป็นมือถือ)
npx expo start --web -c   # รันพร้อมล้าง cache (ใช้เมื่อแก้ config แล้วไม่อัปเดต)
npx tsc --noEmit          # เช็ค type — ต้อง 0 error
```

## Subagent เฉพาะทาง (`.claude/agents/`)

เรียกใช้เมื่องานใหญ่พอที่จะแยกทำ หรือต้องการทำคู่ขนาน — **งานเล็กทำเองเร็วกว่า**
(subagent เริ่มจากศูนย์ ต้องอ่านไฟล์ใหม่หมด = เปลือง token กว่า)

| Agent | ใช้กับ | ขอบเขตไฟล์ |
|-------|--------|-----------|
| `frontend-ui` | หน้าจอ, component, styling, animation, wire ปุ่ม | `src/app/`, `src/components/` |
| `backend-api` | Express, MySQL, JWT, endpoint, SQL, API client | `server/`, `src/api/` |
| `security-auditor` | ตรวจช่องโหว่ (อ่านอย่างเดียว ไม่แก้โค้ด) | ทั้งโปรเจกต์ |

> `frontend-ui` กับ `backend-api` แบ่งขอบเขตไฟล์ไม่ทับกัน → รันพร้อมกันได้ปลอดภัย

## Backend (Phase 2) — เซิร์ฟเวอร์อาจารย์

| รายการ | ค่า |
|--------|-----|
| SSH | `ssh std6730202645@119.59.102.161 -p 2222` (port 2222 ทดสอบแล้วเปิด) |
| Workspace | **`/app`** บนเซิร์ฟเวอร์ |
| Stack | **Node + Express + mysql2 + bcrypt + jsonwebtoken + dotenv** |
| Database | MySQL `ip_std6730202645` · phpMyAdmin: `119.59.102.161/nindamdb` |
| Port ของ API | **Assigned backend port** ที่ระบบแจ้งตอน SSH login (เช่น 30xx) |
| รหัสผ่าน | ดูที่ http://nindam.ddns.net/web/ |

**Backend รันบนเซิร์ฟเวอร์อาจารย์ ไม่ใช่บนเครื่องเรา** (port 3306 ปิดจากภายนอก
MySQL user เป็น `@localhost` → ต่อจากเครื่องเราไม่ได้)

```
Expo App ──HTTP :30xx──► Express (บน /app) ──localhost:3306──► MySQL
```

❌ ห้ามใช้ MongoDB · ❌ ห้ามรัน Express บนเครื่องเราแล้วต่อ MySQL ปลายทาง — ทำไม่ได้
⚠️ `server.js` ต้อง `listen(PORT, '0.0.0.0')` และใช้ **Assigned port เท่านั้น**

**SQL พร้อมแล้ว:** `server/sql/schema.sql` (11 ตาราง) + `server/sql/seed.sql` (12 สินค้า)

## แผนงานถัดไป

`Phase1.md` = แผน Phase 2 (Express + MySQL บนเซิร์ฟเวอร์อาจารย์ + ทำให้ทุกปุ่มใช้งานได้จริง)
