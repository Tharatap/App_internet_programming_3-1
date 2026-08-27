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
| 1 | **ห้าม hardcode สี** — ใช้ palette จาก theme store และ `Radius`/token จาก `src/constants/theme.ts` เท่านั้น |
| 2 | **ห้ามเขียน component ใหม่ทับของเดิม** — ต่อยอดจาก `src/components/shop/` (มี 11 ตัวพร้อมใช้) |
| 3 | **ห้ามเขียนฟังก์ชัน format ราคา/เวลาใหม่** — ใช้ `formatBaht()` / `formatCountdown()` จาก `src/utils/format.ts` |
| 4 | ปุ่มที่กดได้ทุกปุ่มใช้ `PressableScale` (ไม่ใช่ `Pressable` เปล่า) |
| 5 | ข้อความ UI ทั้งหมดเป็น **ภาษาไทย** |
| 6 | หน้าใหม่ทุกหน้าต้องมี `TopBar` ให้สอดคล้องกับหน้าเดิม |
| 7 | เสร็จงานต้องรัน `npx tsc --noEmit` ให้ผ่าน **0 error** ก่อนบอกว่าเสร็จ |
| 8 | **ห้าม commit `.env`** หรือค่า secret ใดๆ |
| 9 | **`Brand` ไม่ใช่ static export อีกต่อไป** — หน้าจอ/component ใหม่ทุกตัวต้องใช้ `useStyles(makeStyles)` + `useBrand()` |

ตัวอย่างย่อสำหรับหน้าจอ/component ใหม่:

```tsx
const makeStyles = (Brand: BrandPalette) => StyleSheet.create({
  screen: { backgroundColor: Brand.background },
});

function Screen() {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();
  // ใช้ styles ใน style prop และ Brand กับสีใน JSX
}
```

## โครงสร้างที่ต้องรู้

```
src/
├── app/              หน้าจอ (Expo Router) — root คือ src/app ไม่ใช่ app/
│   ├── (tabs)/       5 แท็บ: index(Home), catalog, cart, favorites, profile
│   ├── product/[id]  หน้ารายละเอียดสินค้า
│   └── products.tsx  หน้ารายการสินค้า/ผลค้นหา
├── components/shop/  component ใช้ซ้ำ 11 ตัว ← ดูรายละเอียดใน skill chaje-shop
├── constants/theme.ts  LightBrand/DarkBrand, BrandPalette, Radius, AppFrameWidth
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

## เวิร์กโฟลว์ Codex — Claude ออกแบบ prompt, Codex ลงมือเขียนโค้ด

ผู้ใช้มี Codex (ChatGPT) เปิดอยู่ใน IDE เดียวกัน (แถบ CODEX ข้างๆ CHAT) แบ่งหน้าที่กันดังนี้:

1. **Claude ไม่แก้ไฟล์เอง** — งานเขียน/แก้โค้ดทุกก้อน (ฟีเจอร์ใหม่, แก้บั๊ก, refactor ฯลฯ)
   ให้ Claude **ออกแบบ prompt ที่พร้อมใช้งาน** แล้วส่งให้ผู้ใช้ไปวางใน Codex เอง
   (Claude ไม่เรียก `Edit`/`Write` กับไฟล์โค้ดของโปรเจกต์ในกรณีนี้ — ยกเว้นผู้ใช้ขอให้ Claude ทำเอง
   หรือเป็นงานอ่าน/สำรวจ/วิเคราะห์/อัปเดตเอกสารอย่าง `PROGRESS.md`)
2. **prompt ที่ออกแบบต้องพร้อมใช้จริง** ไม่ใช่แค่สรุปสั้นๆ ต้องรวม:
   - บริบท/เป้าหมายของงาน + ไฟล์ที่เกี่ยวข้อง (path ชัดเจน)
   - กฎเหล็กของโปรเจกต์ที่เกี่ยวข้อง (จากตาราง "กฎเหล็ก" ด้านบน) ที่ Codex ต้องทำตาม
   - ขอบเขตชัดเจนว่าทำแค่ไหน ห้ามทำอะไรเกิน
   - เกณฑ์ว่าเสร็จเมื่อไหร่ (เช่น `npx tsc --noEmit` ผ่าน 0 error)
3. ผู้ใช้เอา prompt ไปรันใน Codex เอง แล้วกลับมาแจ้ง Claude ว่า Codex ทำเสร็จแล้ว
4. **หลัง Codex ทำเสร็จ Claude ต้องรีวิวโค้ดที่ Codex เขียนทุกครั้งที่ผู้ใช้แจ้งว่าเสร็จ**
   (อ่านไฟล์ที่ถูกแก้จริง เทียบกับ "กฎเหล็ก" ด้านบน + ตรวจ correctness) แล้วสรุปว่าผ่าน/มีจุดที่ต้องแก้
   ถ้าเจอปัญหาให้ออกแบบ prompt แก้ไขรอบต่อไปให้ Codex ตามข้อ 1-2

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
