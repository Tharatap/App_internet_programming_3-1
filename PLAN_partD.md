# แผน PART D — Production hardening (ส่วนที่เหลือ)

> **สถานะ: ✅ ด่าน 1-3 เสร็จแล้ว (2026-08-27) · ด่าน 4 (pagination) ตัดสินใจข้าม**
> `npx tsc --noEmit` ผ่าน 0 error · PART D ถือว่าปิดครบแล้ว

> ไฟล์นี้คือแผนสำหรับ **Codex** — อ่านทั้งไฟล์ก่อนเริ่ม แล้วทำ **ทีละด่าน** ตามลำดับ
> ห้ามข้ามด่าน ห้ามรวมด่าน · จบแต่ละด่านต้องรัน `npx tsc --noEmit` ให้ผ่าน 0 error แล้วหยุด
> กฎเหล็กอยู่ใน `AGENTS.md` · สถานะงานรวมอยู่ใน `PROGRESS.md` · แผนก่อนหน้าที่ทำจบแล้วดูที่
> `CLEANUP_PLAN.md` (5/5 ก้อน) และ `PLAN_batch4_theme.md` (ธีมมืด 4/4 ด่าน)

## Context — ทำไมต้องทำ

`Phase1.md` หัวข้อ PART D มี 10 ข้อ ทำไปแล้ว 3 ข้อ (Error Boundary, Offline handling,
`tsc --noEmit` 0 error) และ **ข้าม pm2 ถาวร** ตามที่ผู้ใช้ตัดสินใจ (เปิด SSH ค้างไว้เอง)

ตรวจโค้ดจริงแล้วที่เหลือยังไม่ได้ทำเลยสักข้อ:

| ข้อ | หลักฐานจากโค้ด |
|---|---|
| Pull-to-refresh | `grep -rn "RefreshControl\|onRefresh" src/app/` → **0 จุด** ทั้งที่ `catalog-store.refresh()` มีอยู่แล้วและเขียนคอมเมนต์ไว้ว่า *"used for pull-to-refresh"* แต่ไม่มีหน้าไหนเรียก |
| Pagination | `grep -rn "onEndReached" src/app/` → **0 จุด** (backend รองรับ `?page=&limit=` ครบแล้ว) |
| Validation | `src/app/addresses/edit.tsx` เช็คแค่ "ไม่ว่าง" — เบอร์โทร/รหัสไปรษณีย์กรอกอะไรก็ผ่าน |
| Accessibility | `PressableScale` 66 จุด มี `accessibilityLabel` แค่ 30 จุด |

**เป้าหมาย:** ปิด PART D โดยเรียงตาม "ความเสี่ยงตอนสาธิต" ไม่ใช่ตามลำดับในเอกสารเดิม —
งานที่กันข้อมูลขยะเข้า DB และงานที่เห็นผลทันทีมาก่อน งานใหญ่ที่มองไม่เห็นไว้ท้ายสุด

## แบ่งเป็น 4 ด่าน

| ด่าน | เรื่อง | ขนาด | ทำไมอยู่ลำดับนี้ |
|---|---|---|---|
| 1 | Validation ฟอร์มที่อยู่ + สมัครสมาชิก | เล็ก | กันข้อมูลขยะเข้า DB ตอนอาจารย์ลองกรอก |
| 2 | Pull-to-refresh 4 หน้า | เล็ก | เห็นผลทันที ใช้ `refresh()` ที่มีอยู่แล้ว |
| 3 | `accessibilityLabel` 36 จุดที่ขาด | เล็ก-กลาง | งานกลไกล้วน รีวิวเร็ว |
| 4 | Pagination + ย้าย filter ไป server | **ใหญ่** | อ่านหัวข้อ ⚠️ ก่อนตัดสินใจทำ |

---

## ✅ ด่าน 1 — Validation — เสร็จแล้ว

### `src/app/addresses/edit.tsx`
`onSubmit` ตอนนี้เช็คแค่ `!form.recipient || !form.phone || !form.line1`
เพิ่มการตรวจรูปแบบ **ก่อนยิง API**:

- **เบอร์โทร** — ลบช่องว่างและขีดออกก่อน (`replace(/[\s-]/g, '')`) แล้วต้องเป็นตัวเลขล้วน
  9-10 หลัก ขึ้นต้นด้วย `0`
  ไม่ผ่าน → `'เบอร์โทรไม่ถูกต้อง (ตัวเลข 9-10 หลัก ขึ้นต้นด้วย 0)'`
- **รหัสไปรษณีย์** — **ปล่อยว่างได้** (server ไม่บังคับ) แต่ถ้ากรอกมาต้องเป็นตัวเลข 5 หลักพอดี
  ไม่ผ่าน → `'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก'`
- แสดงข้อความผ่าน `styles.error` ที่มีอยู่แล้วในไฟล์ **อย่าใช้ toast** — ฟอร์มนี้มีที่แสดง error อยู่แล้ว
- `TextInput` เบอร์โทร: `keyboardType="phone-pad"` + `maxLength={10}`
- `TextInput` รหัสไปรษณีย์: `keyboardType="number-pad"` + `maxLength={5}`
  (component `Field` ในไฟล์นี้ต้องเพิ่ม prop รับ `keyboardType` / `maxLength` ส่งต่อไปยัง `TextInput`)

### `src/app/(auth)/register.tsx`
- เพิ่มตรวจรูปแบบอีเมลอย่างง่าย `/^\S+@\S+\.\S+$/` → `'รูปแบบอีเมลไม่ถูกต้อง'`
- เงื่อนไขรหัสผ่าน ≥ 8 ตัวมีอยู่แล้ว **ห้ามแตะ**

❌ **ห้ามแตะ `server/`** — server มี validation ขั้นต่ำอยู่แล้ว (`addresses.js:39` คืน 400
พร้อมข้อความไทย) และการแก้ต้อง SSH + FileZilla deploy ใหม่ ไม่คุ้ม

**เกณฑ์จบด่าน 1:** `tsc` 0 error · กรอกเบอร์ `123` แล้วกดบันทึก → ขึ้น error ไม่ยิง API ·
กรอกเบอร์ถูก + รหัสไปรษณีย์ว่าง → บันทึกได้ · กรอกรหัสไปรษณีย์ `123` → ขึ้น error

---

## ✅ ด่าน 2 — Pull-to-refresh — เสร็จแล้ว

`src/store/catalog-store.tsx:112` มี `refresh()` พร้อมใช้อยู่แล้ว (คอมเมนต์เขียนไว้ตั้งแต่แรกว่า
สำหรับ pull-to-refresh) แต่ยังไม่มีหน้าไหนเรียก — **ใช้ตัวนี้ ห้ามเขียน logic โหลดใหม่เอง**

ใส่ `RefreshControl` ให้ 4 หน้า (ทุกหน้าใช้ `FlatList` / `ScrollView` อยู่แล้ว):

| หน้า | ดึงอะไรใหม่ |
|---|---|
| `src/app/(tabs)/index.tsx` | `refresh()` จาก `useCatalog()` + เรียก notifications/addresses ที่อยู่ใน `useFocusEffect` ซ้ำ |
| `src/app/products.tsx` | `refresh()` จาก `useCatalog()` |
| `src/app/orders/index.tsx` | `ordersApi.list(token)` ซ้ำ |
| `src/app/notifications.tsx` | `notificationsApi.list(token)` ซ้ำ |

- แต่ละหน้าเพิ่ม state `refreshing` ของตัวเอง แล้วส่ง:
  ```tsx
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={Brand.text}
      colors={[Brand.text]}
    />
  }
  ```
  ⚠️ ต้องใส่ **ทั้ง `tintColor` (iOS/เว็บ) และ `colors` (Android)** ไม่งั้นสปินเนอร์เป็นสีเทาอ่อน
  ตามค่า default แล้วมองไม่เห็นในโหมดมืด
- หน้าที่ยิง API เอง (orders, notifications): `onRefresh` เป็น async แล้ว `setRefreshing(false)`
  ใน `finally` เสมอ ไม่งั้นสปินเนอร์ค้างเมื่อ API ล้ม
- ⚠️ **หน้าที่ใช้ `refresh()` ของ catalog-store**: ฟังก์ชันนี้เป็น fire-and-forget
  (แค่บวก `reloadKey`) **ไม่ได้คืน Promise** จึง `await` ไม่ได้
  → ให้ตั้ง `refreshing` กลับเป็น `false` ด้วย `useEffect` ที่ดู `loading` จาก `useCatalog()`
  เมื่อ `loading` กลับเป็น `false`

❌ **ห้ามแตะ `src/store/catalog-store.tsx`** — API ที่ต้องใช้มีครบแล้ว

**เกณฑ์จบด่าน 2:** `tsc` 0 error · ลากลงทั้ง 4 หน้าเห็นสปินเนอร์และข้อมูลโหลดใหม่จริง ·
ปิดเซิร์ฟเวอร์แล้วลากลง สปินเนอร์ต้องหยุด ไม่ค้าง · มองเห็นสปินเนอร์ทั้งโหมดสว่างและมืด

---

## ✅ ด่าน 3 — Accessibility — เสร็จแล้ว

`PressableScale` มี 66 จุด แต่มี `accessibilityLabel` แค่ 30 จุด → ขาดอีก **36 จุด**

- ปุ่ม **ไอคอนล้วนไม่มีข้อความ** = กลุ่มที่ต้องใส่ `accessibilityLabel` จริงๆ **ทำกลุ่มนี้ก่อน**
- ปุ่มที่มีข้อความอยู่ในตัวแล้ว (เช่น "เข้าสู่ระบบ") ใส่แค่ `accessibilityRole="button"` พอ
  **ห้ามใส่ label ซ้ำกับข้อความ** — screen reader อ่านข้อความข้างในได้อยู่แล้ว การใส่ซ้ำทำให้อ่านสองรอบ
- label ต้องเป็นภาษาไทยที่สื่อความหมาย เช่น `"เปิดรายละเอียด ตู้เย็น 2 ประตู 7.4 คิว"`
  ไม่ใช่ `"ปุ่ม"` หรือ `"กด"`
- `ProductCard` · `CategoryIcon` · `HeartButton` · `QuantityStepper` เป็น component ที่ใช้ซ้ำหลายที่
  → ใส่ที่ตัว component เดียวจบ ครอบคลุมทุกหน้าที่เรียกใช้ (อย่าไปใส่ทีละ call site)

❌ **ห้ามเปลี่ยน layout / สไตล์ / ตรรกะใดๆ** — ด่านนี้แตะแค่ props ที่เกี่ยวกับ accessibility

**เกณฑ์จบด่าน 3:** `tsc` 0 error · หน้าตาแอปเหมือนเดิมทุกหน้า ·
เปิด DevTools → Elements แล้วปุ่มไอคอนต้องมี `aria-label`

---

## ⏭️ ด่าน 4 — Pagination — **ตัดสินใจข้าม (2026-08-27)**

> ผู้ใช้ตัดสินใจข้ามด่านนี้ เหตุผลบันทึกไว้ใน `PROGRESS.md` หัวข้อ "⚠️ ข้อจำกัดที่รู้อยู่"
> เนื้อหาด้านล่างเก็บไว้เผื่อสินค้าเกิน ~50 รายการแล้วค่อยกลับมาทำ


### ทำไมด่านนี้ไม่เหมือนด่านอื่น

Backend รองรับ `?q=&category=&brand=&minPrice=&maxPrice=&energyMin=&inStock=&sort=&page=&limit=`
ครบแล้ว (`server/routes/products.js:29-32`) **แต่ฝั่งแอปไม่ได้ใช้เลย** — `src/api/catalog.ts`
ยิง `/products?limit=100` ดึงมาทั้งหมดครั้งเดียว แล้ว `src/app/products.tsx` กรอง/เรียงในเครื่อง

**ถ้าทำ pagination อย่างเดียวโดยไม่ย้าย filter ไป server → ตัวกรองจะพัง**
เพราะจะกรองเฉพาะหน้าที่โหลดมาแล้ว ไม่ใช่สินค้าทั้งหมด
ดังนั้นด่านนี้ = ย้าย filter + sort + search + pagination ไป server **พร้อมกัน**

### สิ่งที่ต้องแลก
- `products.tsx` เปลี่ยนจากอ่าน `catalog-store` เป็นยิง API เอง → **หลุดจากห่วงโซ่ fallback
  API → GitHub → bundled** ที่ทำไว้ (เน็ตล่มแล้วหน้านี้ว่างเปล่า แทนที่จะโชว์ข้อมูลสำรอง)
- `FilterSheet` ต้องส่งค่าไป server แทนกรองในเครื่อง — แตะไฟล์ที่ตอนนี้ทำงานถูกต้องอยู่
- **สินค้ามีแค่ 12 ตัว** limit ปกติ 20 → **ไม่มีทางเลื่อนถึงหน้า 2** ผลลัพธ์ที่มองเห็น = ศูนย์

### ถ้าตัดสินใจทำ — ต้องรักษา fallback ไว้
1. `src/api/catalog.ts` เพิ่ม `searchProducts(params)` ตัวใหม่
   **โดยไม่แตะ `listProducts` เดิม** (catalog-store ยังใช้ตัวเดิม fallback ยังทำงาน)
2. `products.tsx` ใช้ `searchProducts` + `onEndReached` โหลดหน้าถัดไป
   ส่ง filter / sort / category / q ไป server
3. **ถ้า `searchProducts` ล้มเหลว → fallback ไปใช้ข้อมูลจาก `catalog-store` + กรองในเครื่องแบบเดิม**
   (เก็บโค้ดกรองเดิมไว้เป็นเส้นทางสำรอง **ห้ามลบ**)
4. `limit` ตั้งที่ **8** เพื่อให้เห็น pagination ทำงานจริงกับสินค้า 12 ตัว
5. ต้องมี `ListFooterComponent` เป็น spinner ตอนกำลังโหลดหน้าถัดไป และกันยิงซ้ำขณะโหลดอยู่

### ถ้าใกล้เดดไลน์ — ข้ามด่านนี้ได้
บันทึกใน `PROGRESS.md` ว่า backend รองรับ pagination แล้ว แต่ฝั่งแอปยังดึงทั้งหมดครั้งเดียว
เพราะแคตตาล็อกมี 12 รายการ — เป็นการตัดสินใจที่อธิบายได้ ไม่ใช่งานที่ลืมทำ
ด่าน 1-3 ให้ผลลัพธ์ที่เห็นได้จริงมากกว่ามาก

---

## ไฟล์ที่แตะ

| ไฟล์ | ด่าน |
|---|---|
| `src/app/addresses/edit.tsx` · `src/app/(auth)/register.tsx` | 1 |
| `src/app/(tabs)/index.tsx` · `src/app/products.tsx` · `src/app/orders/index.tsx` · `src/app/notifications.tsx` | 2 |
| `src/components/shop/product-card.tsx` · `category-icon.tsx` · `heart-button.tsx` · `quantity-stepper.tsx` + หน้าจอที่มีปุ่มไอคอนล้วน | 3 |
| `src/api/catalog.ts` · `src/app/products.tsx` · `src/components/shop/filter-sheet.tsx` | 4 (ถ้าทำ) |

**ของเดิมที่ต้องใช้ซ้ำ ห้ามเขียนใหม่:**
`catalog-store.refresh()` · `useStyles(makeStyles)` + `useBrand()` · `PressableScale` · `Badge` ·
`ConfirmModal` · `useToast()`

**ห้ามแตะ:** `server/` ทั้งหมด · `src/constants/theme.ts` (ค่าสีนิ่งแล้ว) · `src/store/catalog-store.tsx`

**กฎเหล็กที่เกี่ยวข้อง:** ห้าม hardcode สี (ใช้ `useBrand()`) · ปุ่มใช้ `PressableScale` ·
ข้อความ UI ภาษาไทย · หน้าใหม่ต้องมี `TopBar` · `npx tsc --noEmit` ผ่าน 0 error

---

## วิธีทดสอบ

```bash
npx tsc --noEmit
npx expo start --web
```
> ต้องเปิด SSH รัน `node server.js` ค้างไว้ก่อน — ไม่มี pm2 (ตัดสินใจข้ามถาวรแล้ว)

1. **Validation** — ที่อยู่: เบอร์ `123` และรหัสไปรษณีย์ `123` ต้องไม่ผ่าน ·
   รหัสไปรษณีย์ว่างต้องผ่าน · สมัครสมาชิกด้วยอีเมล `abc` ต้องไม่ผ่าน
2. **Pull-to-refresh** — ลากลงทั้ง 4 หน้า · ปิดเซิร์ฟเวอร์แล้วลากลง สปินเนอร์ต้องหยุด ไม่ค้าง
3. **โหมดมืด** — สปินเนอร์ refresh ต้องมองเห็น (พลาดง่ายเพราะ default เป็นสีเทาอ่อน)
4. **Accessibility** — DevTools → Elements ดูว่าปุ่มไอคอนมี `aria-label`

---

## หลังทำเสร็จ

อัปเดต `PROGRESS.md`:
- ย้ายข้อ PART D ที่ทำแล้วไปหัวข้อเสร็จ
- ถ้าข้ามด่าน 4 → เขียนเหตุผลไว้ในหัวข้อ "⚠️ ข้อจำกัดที่รู้อยู่"
- **ลบแถว `cart.tsx:69` ออกจากตาราง "🐛 บั๊กที่รู้แล้ว ยังไม่แก้"** — แก้ไปแล้ว
  (`cart.tsx:90-91` ส่ง `uri={item.product.images[0]}` ครบ) เป็นข้อมูลตกค้างจาก Phase 1
