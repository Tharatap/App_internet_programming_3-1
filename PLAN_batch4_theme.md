# แผนก้อน 4 — ทำให้สวิตช์ในหน้าตั้งค่าใช้งานได้จริง

> **สถานะ: ✅ ด่าน 1–4 เสร็จครบแล้ว (2026-08-27) · `npx tsc --noEmit` ผ่าน 0 error**

> ไฟล์นี้คือแผนสำหรับ **Codex** — อ่านทั้งไฟล์ก่อนเริ่ม แล้วทำ **ทีละด่าน** ตามลำดับ
> ห้ามข้ามด่าน ห้ามรวมด่าน · จบแต่ละด่านต้องรัน `npx tsc --noEmit` ให้ผ่าน 0 error ก่อนไปด่านถัดไป
> อ้างอิงกฎเหล็กของโปรเจกต์ใน `AGENTS.md` · สถานะงานรวมอยู่ใน `PROGRESS.md` · ที่มาของงานอยู่ใน `CLEANUP_PLAN.md` (ก้อนที่ 4)

## Context — ทำไมต้องทำ

หน้า `src/app/settings.tsx` มีสวิตช์ 3 อย่าง — **ธีม** (สว่าง/มืด/ตามระบบ), **ภาษา** (ไทย/English),
**รับการแจ้งเตือนโปรโมชัน** — ทั้งสามกดได้ ติ๊กเปลี่ยน และ `usersApi.updateSettings()` บันทึกลง MySQL
จริง (`users.theme` / `users.language` / `users.notify_promo` มีอยู่ใน schema แล้ว)
**แต่ไม่มีอะไรเกิดขึ้นกับแอปเลย** เพราะ:

- ทุกหน้าจอ import `Brand` จาก `src/constants/theme.ts` แบบ static แล้วฝังสีลง
  `StyleSheet.create` ตอน module load → เปลี่ยนธีมตอน runtime ไม่ได้
  (`src/hooks/use-theme.ts` มีอยู่ แต่ถูกใช้แค่ใน `themed-text` / `themed-view` / `collapsible`
  ซึ่งเป็นไฟล์ template ที่ไม่มีหน้าจอจริงใช้เลย)
- ไม่มีระบบ i18n — ข้อความไทยฝังตายในโค้ดทุกไฟล์
- `notifyPromo` ไม่มีใครอ่านค่าไปใช้ ทั้งที่ตาราง `notifications` มีคอลัมน์ `type`
  (`order | promo | general`) พร้อมให้กรองอยู่แล้ว

**เป้าหมาย:** ทุกปุ่มที่ผู้ใช้เห็นต้อง "ทำงานจริง" หรือ "บอกตรงๆ ว่ายังไม่พร้อม" — ไม่มีปุ่มหลอก

---

## หัวใจของแผน: เปลี่ยน `Brand` เป็นค่าจาก hook โดยไม่แตะเนื้อใน StyleSheet เลย

โค้ดอ้าง `Brand.x` ทั้งหมด **480 จุด ใน 50 ไฟล์** ถ้าแก้ทีละจุดคือหายนะ
แต่ถ้าตั้งชื่อพารามิเตอร์ว่า `Brand` เนื้อในทั้งหมด**ไม่ต้องแก้แม้แต่ตัวอักษรเดียว**:

```ts
// ก่อน
import { Brand } from '@/constants/theme';
const styles = StyleSheet.create({ title: { color: Brand.text } });

// หลัง — เนื้อใน StyleSheet เหมือนเดิมเป๊ะ
import { useStyles } from '@/hooks/use-styles';
import { useBrand } from '@/store/theme-store';
import type { BrandPalette } from '@/constants/theme';

const makeStyles = (Brand: BrandPalette) => StyleSheet.create({ title: { color: Brand.text } });
//                  ^^^^^ ชื่อพารามิเตอร์คือ Brand → บรรทัดข้างในไม่ต้องแตะ

export default function Screen() {
  const styles = useStyles(makeStyles);
  const Brand = useBrand();   // ใส่เฉพาะไฟล์ที่ใช้ Brand.x ใน JSX ด้วย
  ...                          // <Icon color={Brand.text} /> ก็ไม่ต้องแก้เช่นกัน
}
```

diff ต่อไฟล์เหลือแค่ **3 บรรทัด** (แก้ import + ห่อ StyleSheet + เพิ่ม hook 1-2 บรรทัด)
**ห้ามถือโอกาสจัดระเบียบสีหรือแก้ค่าใน StyleSheet ระหว่างทาง** — แอปนี้ใช้งานได้ดีอยู่แล้ว
diff ต้องเล็กที่สุดเพื่อให้รีวิวได้จริง

## แบ่งเป็น 4 ด่าน — แต่ละด่านจบในตัว แอปใช้งานได้ตลอด

| ด่าน | เรื่อง | ขนาด | ผลลัพธ์ |
|---|---|---|---|
| 1 | โครงสร้างธีม (ยังไม่แตะหน้าจอ) | เล็ก | มี `DarkBrand` + `ThemeProvider` + `useStyles` พร้อมใช้ · แอปยังหน้าตาเดิม |
| 2 | ย้าย `src/components/shop/` (17 ไฟล์) | กลาง | component ทุกตัวรองรับธีม |
| 3 | ย้าย `src/app/` (33 ไฟล์) + เปิดสวิตช์ธีม | ใหญ่ | **ธีมมืดใช้งานได้จริงทั้งแอป** |
| 4 | แจ้งเตือนโปรโมชัน + ป้ายภาษา | เล็ก | `notifyPromo` กรองจริง · ภาษาติดป้ายตรงไปตรงมา |

---

## ✅ ด่าน 1 — โครงสร้างธีม — เสร็จแล้ว

### `src/constants/theme.ts` (แก้)
- เปลี่ยนชื่อ object `Brand` ปัจจุบัน → `LightBrand` (**ค่าสีเดิมทุกตัว ห้ามแก้แม้แต่ตัวเดียว**)
- เพิ่ม `DarkBrand` ที่มี **คีย์ครบเท่ากันทุกตัว** (21 คีย์) โทนมืดของธีม cozy pixel:
  - พื้นหลังน้ำตาลเข้มอมครีม **ไม่ใช่ดำสนิท** (ให้เข้ากับธีม pixel เดิม)
  - `divider` (เส้นขอบ pixel) เป็นครีมอ่อน — ธีมนี้ใช้เส้นขอบหนาทุกที่ ถ้าเส้นหายแอปจะดูแบน
  - `accent` เขียวมะนาว `#D6F26A` **คงเดิม** (เป็นสีแบรนด์) พร้อม `onAccent` เข้มเหมือนเดิม
  - ตัวอักษร `text` / `textSecondary` / `textMuted` เป็นโทนครีมไล่ระดับ
  - สีพาสเทล (`skyBlue` / `saleBg` / `tan` / `mint` / `favoriteBg`) ปรับให้เข้มลง
    **แต่ยังต้องให้ตัวอักษรสีเข้มที่วางทับอยู่อ่านออก** (badge/chip ใช้คู่กันอยู่)
- `export type BrandPalette = typeof LightBrand;`
- **คงบรรทัด `export const Brand = LightBrand;` ไว้** — เพื่อให้ 50 ไฟล์ที่ยังไม่ย้ายคอมไพล์ผ่าน
  ระหว่างด่าน 2-3 (จะลบทิ้งตอนจบด่าน 3)
- `CategoryPalette` (สีพาสเทลชิปหมวดหมู่) ยังเป็นค่าคงที่ได้ — ไม่ต้องทำ 2 ชุด

### `src/store/theme-store.tsx` (สร้างใหม่)
- `ThemeProvider` + hooks:
  - `useThemeMode()` → `{ mode, resolved, setMode }` โดย `mode: 'light' | 'dark' | 'system'`
    และ `resolved: 'light' | 'dark'` (ค่าที่ใช้จริงหลังแปลง `system` แล้ว)
  - `useBrand()` → `BrandPalette`
- โหมด `system` อ่านจาก `useColorScheme()` ที่มีอยู่แล้วใน `src/hooks/use-color-scheme.ts`
  (+ `.web.ts`) — **ห้ามเขียนใหม่**
- persist ลง `secureStorage` (`src/utils/secure-storage.ts`) key `chaje_theme_mode`
  → เปิดแอปมาได้ธีมถูกทันที ไม่ต้องรอโหลดโปรไฟล์
- `setMode()` ทำแค่ **state + secureStorage เท่านั้น** (ดูเหตุผลในหัวข้อ ⚠️ ข้างล่าง)
- ต้องทำงานได้แม้ยังไม่ล็อกอิน (guest / ยังไม่ login) — ห้ามพึ่ง token

### `src/hooks/use-styles.ts` (สร้างใหม่)
```ts
export function useStyles<T>(makeStyles: (brand: BrandPalette) => T): T {
  const brand = useBrand();
  return useMemo(() => makeStyles(brand), [makeStyles, brand]);
}
```
factory ต้องประกาศที่ **module scope เสมอ** identity จะได้คงที่ ไม่สร้าง StyleSheet ใหม่ทุก render

### `src/app/_layout.tsx` (แก้)
- ครอบ `ThemeProvider` ไว้ **นอกสุด** (เหนือ `AuthProvider`) เพราะทั้งแอปต้องใช้สี
  ลำดับใหม่:
  `ErrorBoundary > GestureHandlerRootView > ThemeProvider > AuthProvider > CatalogProvider > ToastProvider > ShopProvider`

> ⚠️ **จุดที่ต้องระวังที่สุดของด่านนี้**
> `ThemeProvider` อยู่ **นอก** `AuthProvider` จึงเรียก `useAuth()` ไม่ได้ (จะ throw ทันทีที่เปิดแอป)
> ดังนั้น **ห้ามให้ `theme-store` ยิง `usersApi.updateSettings` เอง**
> ให้ `src/app/settings.tsx` เป็นคนยิง API เอง (ทำในด่าน 3) — สองสโตร์ต้องไม่อ้างอิงกันไขว้

**เกณฑ์จบด่าน 1:** `npx tsc --noEmit` 0 error · เปิดแอปแล้วหน้าตาเหมือนเดิมทุกหน้า
(ยังไม่มีอะไรเปลี่ยนธีม เพราะยังไม่มีไฟล์ไหนใช้ `useBrand`)

---

## ✅ ด่าน 2 — ย้าย `src/components/shop/` (17 ไฟล์) — เสร็จแล้ว

ทำตามสูตร "พารามิเตอร์ชื่อ `Brand`" กับทุกไฟล์ใน `src/components/shop/`

### เคสพิเศษ 2 ไฟล์ (ต้องแก้มือ ห้ามใช้สูตรตรงๆ)
1. **`badge.tsx`** — มี `toneStyles` เป็น constant ที่ module scope
   (ไฟล์เดียวในโปรเจกต์ที่ใช้ `Brand` นอก component และนอก StyleSheet)
   → เปลี่ยนเป็นฟังก์ชัน `makeToneStyles(Brand: BrandPalette)` แล้วเรียกใน component
2. **`pressable-scale.tsx`** — `shadowColor = Brand.divider` เป็น default parameter
   → เปลี่ยนเป็น `shadowColor?: string` แล้วภายในทำ `const color = shadowColor ?? Brand.divider;`
   **ห้ามแก้ตรรกะ animation / `pixelShadow` / `activeScale` ใดๆ**

**เกณฑ์จบด่าน 2:** tsc 0 error · หน้าตาแอปเหมือนเดิมทุกหน้า (ธีมยังเป็น light เสมอ)

---

## ✅ ด่าน 3 — ย้าย `src/app/` (33 ไฟล์) + เปิดสวิตช์ธีมจริง — เสร็จแล้ว

สูตรเดียวกัน แต่ **แบ่งเป็น 2 กลุ่มย่อย รัน `tsc` คั่นทุกกลุ่ม**:
- **3a:** `src/app/(tabs)/` (6 ไฟล์) + `src/app/(auth)/` (4 ไฟล์)
- **3b:** `src/app/` ที่เหลือ — `product/[id]`, `products`, `search`, `settings`, `notifications`,
  `coupons`, `addresses/`×2, `orders/`×2, `checkout/`×4, `admin/`×2, `_layout.tsx`

### จุดที่ไม่ใช่แค่ StyleSheet — ต้องแก้มือ
- **`src/app/_layout.tsx`**
  - `styles.root` มีสีพื้นเทา `'#E9E9EC'` hardcode สำหรับพื้นหลังเว็บ → ย้ายเป็นคีย์ใหม่ใน palette
    (เช่น `webBackdrop`) ทั้ง light/dark — ผิดกฎเหล็กข้อ 1 อยู่แต่เดิม ถือโอกาสแก้
  - `<StatusBar style={...} />` ต้องเป็น `'light'` เมื่อธีมมืด, `'dark'` เมื่อสว่าง
- **`src/app/(tabs)/_layout.tsx`** — `screenOptions` ของ `<Tabs>`
  (`tabBarActiveTintColor`, `tabBarInactiveTintColor`, `tabBarStyle`, `tabBarBadgeStyle`)
  ต้องอ่านจาก `useBrand()` ในตัว component
- **`src/app/(auth)/_layout.tsx`** และ **`src/app/checkout/_layout.tsx`** — `contentStyle.backgroundColor`
- **`src/app/_layout.tsx`** ยังมี `contentStyle` ของ root `<Stack>` ด้วย

### ปิดท้ายด่าน 3 — ตัวยืนยันว่าย้ายครบ
ลบ `export const Brand = LightBrand;` ออกจาก `src/constants/theme.ts` แล้วรัน `npx tsc --noEmit`
ถ้ายังมีไฟล์ไหนหลุด จะฟ้องทันที → ตามไปแก้ให้หมดจนผ่าน 0 error

### เปิดสวิตช์จริงที่ `src/app/settings.tsx`
- `theme` state เดิม (`useState`) → ใช้ `useThemeMode()` จากสโตร์แทน
- กดชิป → `setMode(value)` **แล้วยิง** `usersApi.updateSettings({ theme: value })` ต่อ
  (ยิงที่หน้านี้เท่านั้น เพราะที่นี่เรียก `useAuth()` ได้ — ดูเหตุผลในด่าน 1)
  ถ้าไม่มี token ให้ข้ามการยิง API แต่ยังเปลี่ยนธีมได้

**เกณฑ์จบด่าน 3:**
- tsc 0 error · `src/constants/theme.ts` ไม่มี `export const Brand` แล้ว
- กดชิป "มืด" → **ทุกหน้า**เปลี่ยนสีทันที · refresh แล้วยังมืด
- เปลี่ยนธีมของ OS → โหมด "ตามระบบ" ตามจริง
- อ่านตัวอักษรออกทุกหน้าในโหมดมืด โดยเฉพาะ badge, chip, tab bar, ConfirmModal, toast

---

## ✅ ด่าน 4 — แจ้งเตือนโปรโมชัน (ของจริง) + ภาษา (ป้ายตรงไปตรงมา) — เสร็จแล้ว

### แจ้งเตือนโปรโมชัน — ทำให้ทำงานจริง
ตาราง `notifications` มีคอลัมน์ `type` (`order | promo | general`) อยู่แล้ว → **กรองฝั่งแอป**
(ไม่ต้อง deploy server ใหม่ ซึ่งต้อง SSH + FileZilla ทุกครั้ง)

- **`src/store/auth-store.tsx`** — เพิ่ม `updateSettings(patch)` ที่ set `user.settings` ใน state
  แล้วยิง `usersApi.updateSettings` ให้ค่าที่เปลี่ยนสะท้อนไปหน้าอื่นทันที
  (ตอนนี้ `settings.tsx` เก็บเป็น local `useState` → หน้าอื่นไม่รู้เรื่องเลย)
- **`src/app/settings.tsx`** — `notifyPromo` อ่าน/เขียนผ่าน `useAuth()` แทน local state
- **`src/app/notifications.tsx`** — ถ้า `user.settings.notifyPromo === false` ให้กรอง
  `type === 'promo'` ออกจากลิสต์ · ถ้ากรองแล้วว่างให้ขึ้น empty state ที่บอกเหตุผล
  ("ปิดการแจ้งเตือนโปรโมชันอยู่ — เปิดได้ในหน้าตั้งค่า")
- **`src/app/(tabs)/index.tsx`** — จุดแดง `hasUnread` ต้องไม่นับ notification ประเภท `promo`
  เมื่อผู้ใช้ปิดไว้

### ภาษา — ยังไม่ทำ i18n จริง แต่ต้องไม่หลอก
i18n จริงต้องถอดข้อความไทยทุกไฟล์ออกเป็น dictionary (~2-3 วัน) และถ้าแปลไม่ครบ
แอปจะกลายเป็นไทยปนอังกฤษซึ่ง **แย่กว่าไม่มีปุ่ม** จึงกันไว้เป็นเฟสแยก:
- ชิปภาษา: `disabled` + ลด opacity + ต่อท้ายหัวข้อ "ภาษา" ด้วย
  `<Badge label="เร็วๆ นี้" tone="neutral" />` — ใช้ `src/components/shop/badge.tsx` ที่มีอยู่
  **ห้ามสร้าง component ใหม่** (กฎเหล็กข้อ 2)
- ยังคงแสดงค่าที่บันทึกไว้ใน DB ตามเดิม (ไม่ลบ state / ไม่ลบ API call)

**เกณฑ์จบด่าน 4:** tsc 0 error · ปิดสวิตช์โปรโมชัน → แจ้งเตือน `promo` หายจากลิสต์และจุดแดงหาย
**ทันทีโดยไม่ต้อง refresh** · เปิดกลับ → กลับมา · ชิปภาษากดไม่ได้และมีป้าย "เร็วๆ นี้"

---

## ไฟล์หลักที่แตะ

| ไฟล์ | ด่าน | ทำอะไร |
|---|---|---|
| `src/constants/theme.ts` | 1, 3 | `LightBrand` + `DarkBrand` + `BrandPalette` · ลบ `Brand` ตอนจบด่าน 3 |
| `src/store/theme-store.tsx` | 1 | ใหม่ — `ThemeProvider`, `useBrand`, `useThemeMode` |
| `src/hooks/use-styles.ts` | 1 | ใหม่ — `useStyles(makeStyles)` |
| `src/app/_layout.tsx` | 1, 3 | ครอบ `ThemeProvider` นอกสุด · `StatusBar` ตามธีม · `webBackdrop` |
| `src/components/shop/*.tsx` (17) | 2 | สูตร `makeStyles(Brand)` · เคสพิเศษ `badge.tsx`, `pressable-scale.tsx` |
| `src/app/**/*.tsx` (33) | 3 | สูตรเดียวกัน · `(tabs)/_layout.tsx` กับ `_layout.tsx` แก้มือ |
| `src/app/settings.tsx` | 3, 4 | ต่อ `useThemeMode()` · ป้าย "เร็วๆ นี้" ที่ภาษา · `notifyPromo` ผ่าน auth-store |
| `src/store/auth-store.tsx` | 4 | เพิ่ม `updateSettings(patch)` ให้ `user.settings` สะท้อนทั้งแอป |
| `src/app/notifications.tsx`, `src/app/(tabs)/index.tsx` | 4 | กรอง `type === 'promo'` |

**ของเดิมที่ต้องใช้ซ้ำ ห้ามเขียนใหม่:**
`useColorScheme()` (`src/hooks/use-color-scheme.ts`) · `secureStorage` (`src/utils/secure-storage.ts`) ·
`Badge` (`src/components/shop/badge.tsx`) · `usersApi.updateSettings` (`src/api/users.ts`)

**ห้ามแตะ:**
- โฟลเดอร์ `server/` ทั้งหมด (ไม่ต้อง deploy ใหม่)
- `src/hooks/use-theme.ts` และ `themed-text` / `themed-view` / `collapsible`
  (ไฟล์ template ที่ไม่มีหน้าจอไหนใช้ — ปล่อยไว้เฉยๆ)

---

## ความเสี่ยงที่รู้อยู่

1. **ด่าน 3 แตะ 33 ไฟล์** — ถ้าทำรวดเดียวแล้วพลาด จะหาต้นตอยาก → บังคับแบ่ง 3a/3b และรัน `tsc` คั่น
2. **`useStyles` ต้องมี `useMemo`** และ factory ต้องอยู่ module scope
   ไม่งั้น `StyleSheet.create` จะถูกเรียกใหม่ทุก render
3. **โหมดมืดอาจอ่านไม่ออกบางจุด** — badge/chip ที่ใช้สีพาสเทลคู่กับตัวอักษรสีเข้ม
   ต้องไล่ดูด้วยตาทุกหน้าหลังด่าน 3 ไม่ใช่แค่เชื่อว่า tsc ผ่าน
4. **guest (ไม่ล็อกอิน)** — ธีมต้องใช้ได้เหมือนกัน (เก็บใน secureStorage อย่างเดียว ไม่ยิง API)
   `setMode` ต้องไม่พังเมื่อ `token` เป็น `null`
5. **`ThemeProvider` เรียก `useAuth()` ไม่ได้** — ดูกล่อง ⚠️ ในด่าน 1

---

## วิธีทดสอบ (หลังจบทุกด่าน)

```bash
npx tsc --noEmit          # ต้อง 0 error
npx expo start --web -c   # -c เพราะแก้ไฟล์ theme
```

1. **ธีม** — ตั้งค่า → กด "มืด" → ทุกหน้าเปลี่ยนทันที
   (Home, ตะกร้า, รายละเอียดสินค้า, checkout, แอดมิน, modal, toast)
2. **คงค่า** — refresh (F5) → ยังมืด · logout → login ใหม่ → ยังมืด
3. **ตามระบบ** — กด "ตามระบบ" แล้วสลับธีมของ Windows → แอปตามทันที
4. **guest** — เข้าแบบผู้เยี่ยมชม (ไม่ล็อกอิน) → เปลี่ยนธีมได้ ไม่ error
5. **แจ้งเตือน** — ปิดสวิตช์โปรโมชัน → รายการ `promo` หายจาก `/notifications` + จุดแดงบน Home หาย
   → เปิดกลับ → กลับมา
6. **ภาษา** — ชิปกดไม่ได้ มีป้าย "เร็วๆ นี้"
7. **อ่านออกไหม** — ไล่ดูทุกหน้าในโหมดมืด เน้น badge ลดราคา, chip ตัวกรอง, tab bar,
   ConfirmModal, toast, กรอบมือถือ 480px บนเว็บ

---

## หลังทำเสร็จ

อัปเดตเอกสาร:
- `CLEANUP_PLAN.md` — ติ๊ก ✅ ก้อน 4
- `PROGRESS.md` — บันทึกว่าธีมมืด + แจ้งเตือนโปรฯ ใช้งานได้จริงแล้ว · i18n ยกไปเป็นเฟสถัดไป
- `AGENTS.md` — **เพิ่มกฎเหล็กข้อใหม่**: `Brand` ไม่ใช่ static export อีกต่อไป
  หน้าจอ/component ใหม่ทุกตัวต้องใช้ `useStyles(makeStyles)` + `useBrand()`
  (กันไม่ให้ session หน้าเขียนแบบเก่าแล้วธีมมืดพังเป็นหย่อมๆ)
