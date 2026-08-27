# CLEANUP PLAN — ของที่ "มีอยู่ใน UI แต่ยังใช้จริงไม่ได้"

> ตรวจโค้ดจริงทั้งโปรเจกต์เมื่อ 2026-08-13 (ไม่ได้อ่านจากเอกสารเก่า)
> เรียงตามความรุนแรง · แต่ละก้อนมี prompt พร้อมส่ง Codex อยู่ท้ายหัวข้อ
> ทำทีละก้อน แล้วกลับมาติ๊ก ✅ + อัปเดต `PROGRESS.md`

## สรุปสั้น

| ก้อน | เรื่อง | ความรุนแรง | สถานะ |
|------|--------|-----------|-------|
| 1 | `Alert.alert` เป็น no-op บนเว็บ → 11 จุดตายเงียบ | 🔴 พังจริง | ✅ 2026-08-13 |
| 2 | ปุ่ม `⋯` โผล่ 16 หน้า ไม่มี handler เลยสักหน้า | 🔴 พังจริง | ✅ 2026-08-13 |
| 3 | ข้อมูลปลอมที่ดูเหมือนของจริง (ที่อยู่ / countdown / stats) | 🟠 หลอกตา | ✅ 2026-08-13 |
| 4 | ธีมมืด+แจ้งเตือนโปรโมชันใช้งานจริง · ภาษาติดป้าย "เร็วๆ นี้" | 🟠 หลอกตา | ✅ 2026-08-27 |
| 5 | เก็บกวาดเล็กน้อย (logout ปลายทาง, `Pressable` ผิดกฎ #4) | 🟡 เล็ก | ✅ 2026-08-13 |

**เก็บครบทั้ง 5 ก้อนแล้ว** ✅

---

## ✅ ก้อนที่ 1 — `Alert.alert` ไม่ทำงานบนเว็บเลย — **แก้แล้ว 2026-08-13**

> สร้าง `src/components/shop/confirm-modal.tsx` + `src/components/shop/toast.tsx`
> (`ToastProvider` วางไว้ระหว่าง `CatalogProvider` กับ `ShopProvider` ใน `src/app/_layout.tsx`)
> แทนที่ `Alert.alert` ครบทั้ง 11 จุด · `grep -rn "Alert.alert" src/` เหลือ 0
> ⚠️ ระหว่างทางเจอบั๊ก: `ToastProvider` ห่อ children ด้วย View ที่ไม่มี `width` ทำให้กรอบ 480px
> บนเว็บพัง — แก้ด้วยการใส่ `width:'100%'` + `alignItems:'center'` ใน `styles.provider`
> **บทเรียน: component ที่ห่อทั้งแอปต้องส่งความกว้างต่อเสมอ เพราะ `root` ตั้ง `alignItems:'center'`**
> เหลือค้าง (ไม่แก้ก็ได้ ถ้าส่งงานบนเว็บ): บน native toast ชิดขอบจอ ไม่มีระยะห่าง 16px

<details><summary>รายละเอียดเดิม (เก็บไว้อ้างอิง)</summary>

### ปัญหาที่เจอ

### หลักฐาน
`node_modules/react-native-web/dist/exports/Alert/index.js` ทั้งไฟล์คือ:
```js
class Alert { static alert() {} }
```
**เมธอดว่างเปล่า** — เรียกแล้วไม่เกิดอะไรขึ้น ไม่ error ด้วย
เราเดโม/ส่งงานบนเว็บ (`localhost:8081`) แปลว่า **ทุก Alert ในแอปตายหมด**

### ผลกระทบจริง 11 จุด

| ไฟล์:บรรทัด | อาการบนเว็บ | ความรุนแรง |
|---|---|---|
| `src/app/addresses/index.tsx:44` | **ปุ่มลบที่อยู่ตายสนิท** — โค้ดลบอยู่ใน callback ของ Alert ที่ไม่มีวันถูกเรียก | 🔴 ฟีเจอร์หาย |
| `src/app/settings.tsx:49` | **ปุ่ม "ล้างแคช" ตายสนิท** — เหตุผลเดียวกัน | 🔴 ฟีเจอร์หาย |
| `src/app/(tabs)/cart.tsx:32` | กด "ชำระเงิน" โดยไม่เลือกสินค้า → ไม่มีอะไรเกิดขึ้น ผู้ใช้ไม่รู้ว่าทำไม | 🟠 งง |
| `src/store/shop-store.tsx:140,157,179,201,218,241` | เพิ่ม/ลบตะกร้า, เปลี่ยนจำนวน, กดหัวใจ **ล้มเหลวแบบเงียบสนิท** (optimistic update ค้างอยู่ แต่ server ไม่ได้บันทึก → refresh แล้วของหาย) | 🔴 ข้อมูลเพี้ยน |
| `src/app/admin/products.tsx:39`, `src/app/admin/product-form.tsx:131` | ลบสินค้าไม่สำเร็จ → ไม่มีข้อความบอก | 🟠 งง |

### วิธีแก้ที่เลือก
มี `src/components/shop/delete-confirm-modal.tsx` เป็นแม่แบบ Modal ที่ทำงานได้จริงบนเว็บอยู่แล้ว
→ สร้าง 2 ตัวใหม่ในสไตล์เดียวกัน แล้วแทนที่ `Alert.alert` ทุกจุด (กฎ #2: ต่อยอด ไม่เขียนทับ)
1. `ConfirmModal` — ยืนยัน/ยกเลิก (ใช้กับลบที่อยู่, ล้างแคช)
2. `useToast` + `ToastHost` — ข้อความแจ้งเตือนชั่วคราว (ใช้กับ error ทั้งหมดใน shop-store)

### Prompt สำหรับ Codex — ก้อนที่ 1

```
บริบท: แอปรันบนเว็บเป็นหลัก แต่ `Alert` ของ react-native-web (v0.21) คือ
`class Alert { static alert() {} }` — เมธอดว่างเปล่า ไม่ทำอะไรเลย
ทำให้ Alert ทั้ง 11 จุดในแอปตายเงียบบนเว็บ จุดที่ร้ายที่สุดคือปุ่มลบที่อยู่กับปุ่มล้างแคช
ที่โค้ดทำงานจริงอยู่ใน callback ของ Alert → ฟีเจอร์หายไปทั้งอัน

เป้าหมาย: แทนที่ Alert.alert ทุกจุดด้วย Modal/Toast ที่ทำงานได้จริงทั้งเว็บและ native

งานที่ 1 — สร้าง ConfirmModal
ไฟล์ใหม่: src/components/shop/confirm-modal.tsx
- ลอกโครงจาก src/components/shop/delete-confirm-modal.tsx (Modal + Pressable backdrop +
  PixelPanel + stopPropagation) แต่ตัดส่วนที่ต้องพิมพ์ข้อความยืนยันออก
- Props:
    visible: boolean;
    title: string;
    message?: string;
    confirmText?: string;   // default 'ยืนยัน'
    cancelText?: string;    // default 'ยกเลิก'
    destructive?: boolean;  // true → ปุ่มยืนยันใช้ Brand.danger
    onCancel: () => void;
    onConfirm: () => void;
- ใช้ Brand/PixelBorder/PixelFonts/Radius เท่านั้น ปุ่มใช้ PressableScale ข้อความไทย

งานที่ 2 — สร้างระบบ Toast
ไฟล์ใหม่: src/components/shop/toast.tsx
- export `ToastProvider` (context) + `useToast()` ที่คืน `showToast(message: string)`
- ToastProvider render children + แถบ toast ลอยด้านล่าง (เหนือ tab bar ~90px)
  แสดง 3 วินาทีแล้วหายเอง ถ้าเรียกซ้ำให้รีเซ็ตเวลานับใหม่
- สไตล์: พื้น Brand.surface, borderWidth PixelBorder.base, borderColor Brand.divider,
  ตัวอักษร PixelFonts.bodySemiBold, สี Brand.text — ห้าม hardcode สี
- ใช้ Animated fade เข้า/ออกก็ได้ แต่ไม่บังคับ ห้ามติดตั้ง lib ใหม่

งานที่ 3 — ต่อ ToastProvider เข้าแอป
ไฟล์: src/app/_layout.tsx
- ครอบ ToastProvider ไว้ "ข้างใน" ShopProvider ไม่ได้ เพราะ shop-store ต้องเรียก useToast
  → ให้วาง ToastProvider ไว้ "นอก" ShopProvider (ลำดับ: AuthProvider > CatalogProvider >
  ToastProvider > ShopProvider) เพื่อให้ shop-store เรียก useToast() ได้

งานที่ 4 — แทนที่ Alert ใน shop-store ด้วย toast
ไฟล์: src/store/shop-store.tsx (6 จุด: บรรทัด 140, 157, 179, 201, 218, 241)
- เรียก `const { showToast } = useToast();` ใน ShopProvider
- เปลี่ยน `Alert.alert('หัวข้อ', 'ข้อความ')` → `showToast('หัวข้อ')` โดยคงใจความเดิม
  เช่น 'เพิ่มสินค้าลงตะกร้าไม่สำเร็จ' / 'อัปเดตรายการโปรดไม่สำเร็จ'
- ลบ import Alert ออกจากไฟล์

งานที่ 5 — แทนที่ Alert ที่เป็น confirm dialog
ไฟล์: src/app/addresses/index.tsx (บรรทัด 44)
- เพิ่ม state `const [pendingDelete, setPendingDelete] = useState<Address | null>(null);`
- onDelete เปลี่ยนเป็น setPendingDelete(address) เฉยๆ
- render <ConfirmModal visible={!!pendingDelete} title="ลบที่อยู่นี้?"
  message={pendingDelete?.line1} confirmText="ลบ" destructive
  onCancel={() => setPendingDelete(null)}
  onConfirm={ลบจริงแล้ว load() แล้ว setPendingDelete(null)} />
- ถ้า addressesApi.remove throw → showToast('ลบที่อยู่ไม่สำเร็จ')

ไฟล์: src/app/settings.tsx (บรรทัด 49)
- ทำแบบเดียวกันกับ onClearCache: state boolean + ConfirmModal
  title="ล้างแคช" message="ล้างประวัติการค้นหาทั้งหมด?" confirmText="ล้าง" destructive
  onConfirm → searchHistory.clear() + showToast('ล้างประวัติการค้นหาแล้ว')

งานที่ 6 — แทนที่ Alert ที่เหลือด้วย toast
- src/app/(tabs)/cart.tsx:32 → showToast('เลือกสินค้าอย่างน้อย 1 ชิ้นก่อนชำระเงิน')
- src/app/admin/products.tsx:39 และ src/app/admin/product-form.tsx:131
  → showToast(err.message ?? 'ลบสินค้าไม่สำเร็จ')
- ลบ import Alert ที่ไม่ได้ใช้แล้วออกจากทุกไฟล์

ขอบเขต: แตะได้เฉพาะ — confirm-modal.tsx (ใหม่), toast.tsx (ใหม่), _layout.tsx,
shop-store.tsx, addresses/index.tsx, settings.tsx, (tabs)/cart.tsx,
admin/products.tsx, admin/product-form.tsx
❌ ห้ามแตะ delete-confirm-modal.tsx (ใช้งานได้ดีอยู่แล้ว) · ❌ ห้ามแตะ server/
❌ ห้ามติดตั้ง package ใหม่

กฎเหล็ก: ห้าม hardcode สี · ปุ่มใช้ PressableScale · ข้อความไทย · tsc --noEmit 0 error

เกณฑ์เสร็จ:
- `npx tsc --noEmit` ผ่าน 0 error
- `grep -rn "Alert.alert" src/` ต้องไม่เหลือสักจุด
- บนเว็บ: ลบที่อยู่ได้จริง · ล้างแคชได้จริง · กดชำระเงินโดยไม่เลือกสินค้าแล้วมีข้อความเตือน
```

</details>

---

## ✅ ก้อนที่ 2 — ปุ่ม `⋯` โผล่ทุกหน้า ไม่มี handler — **แก้แล้ว 2026-08-13**

> `src/components/shop/top-bar.tsx` — default `showOptions` เป็น `false` + เงื่อนไข render
> เป็น `showOptions && onOptions` (กันปุ่มตายอีกชั้น) · ลบ `showOptions={false}` ที่ซ้ำซ้อน
> ออกจาก `login.tsx`/`register.tsx` · ไม่ต้องแตะ call site อีก 16 จุด ปุ่มหายไปเอง
> ปุ่มตัวกรองใน `products.tsx` ไม่โดนหางเลข (ส่ง `showFilter` + `onFilter` ครบอยู่แล้ว)

<details><summary>รายละเอียดเดิม (เก็บไว้อ้างอิง)</summary>

### ปัญหาที่เจอ
`src/components/shop/top-bar.tsx:116-120` render ปุ่ม `MoreHorizontal` เมื่อ `showOptions !== false`
ซึ่ง default คือ `true` → แสดงทุกหน้าที่ใช้ `variant="list"`

`grep -rn "onOptions" src/app/` → **ไม่เจอสักจุดเดียว** แปลว่า `onOptions` เป็น `undefined` เสมอ
ปุ่มนี้จึงกดได้แต่ไม่เกิดอะไรขึ้นใน **16 หน้า**: cart, catalog, favorites, profile, settings,
notifications, coupons, addresses×2, orders×2, checkout×2, admin×2, products

(หน้า login/register รอบล่าสุดส่ง `showOptions={false}` ไปแล้ว จึงไม่มีปัญหา)

### วิธีแก้ที่แนะนำ
กลับ default เป็น `false` แล้วเปิดเฉพาะหน้าที่จะทำเมนูจริง — ปุ่มที่กดแล้วไม่มีอะไรเกิดขึ้น
แย่กว่าไม่มีปุ่ม ถ้าภายหลังอยากได้เมนูจริงค่อยส่ง `showOptions onOptions={...}` เป็นราย

### Prompt สำหรับ Codex — ก้อนที่ 2

```
บริบท: src/components/shop/top-bar.tsx:116-120 render ปุ่ม ⋯ (MoreHorizontal) โดย
`showOptions` มี default เป็น true แต่ `grep -rn "onOptions" src/app/` ไม่เจอสักจุด
แปลว่าไม่มีหน้าไหนส่ง handler มาเลย ปุ่มนี้กดได้แต่ไม่เกิดอะไรขึ้นใน 16 หน้า

งาน:
ไฟล์: src/components/shop/top-bar.tsx
- ใน ListBar เปลี่ยน default ของ showOptions จาก `= true` เป็น `= false`
- เปลี่ยนเงื่อนไข render ปุ่ม ⋯ เป็น `showOptions && onOptions ? (...) : null`
  (กันพลาดอีกชั้น — ต่อให้ส่ง showOptions มาแต่ลืมส่ง onOptions ก็ไม่ขึ้นปุ่มตาย)
- เพิ่ม JSDoc สั้นๆ เหนือ prop ว่า "ต้องส่ง onOptions มาด้วยถึงจะแสดงปุ่ม"

ไฟล์: src/app/(auth)/login.tsx และ src/app/(auth)/register.tsx
- ลบ prop `showOptions={false}` ที่ไม่จำเป็นแล้วออก (default เป็น false แล้ว)

ขอบเขต: 3 ไฟล์นี้เท่านั้น ห้ามแตะ call site TopBar อื่นอีก 16 จุด
(ทุกจุดไม่เคยส่ง onOptions อยู่แล้ว → ปุ่มจะหายไปเองโดยไม่ต้องแก้ทีละไฟล์)

เกณฑ์เสร็จ:
- tsc --noEmit 0 error
- เปิดหน้า cart / settings / orders → ต้องไม่มีปุ่ม ⋯ ที่มุมขวาบนอีก
- ปุ่มย้อนกลับ ← และปุ่มตัวกรองยังทำงานปกติ
```

</details>

---

## ✅ ก้อนที่ 3 — ข้อมูลปลอมที่แสดงเหมือนของจริง — **แก้แล้ว 2026-08-13**

> - `src/app/(tabs)/index.tsx:39-46` — ที่อยู่บนหัว Home ดึงจริงจาก `addressesApi.list()`
>   (`Promise.all` คู่กับ notifications แต่ละตัวมี `.catch(() => [])` แยก → ตัวหนึ่งล่มอีกตัวยังทำงาน)
>   หาที่ `isDefault` ก่อน ไม่มีก็ใช้ตัวแรก · ไม่ล็อกอิน/ไม่มีที่อยู่ → 'ยังไม่ได้ตั้งที่อยู่จัดส่ง'
> - `src/components/shop/top-bar.tsx:24,66-72` — `HomeProps` เพิ่ม `onAddressPress?`
>   ถ้าไม่ส่งมาก็ render `View` เหมือนเดิม (เข้ากันได้กับของเก่า)
> - `src/app/(tabs)/profile.tsx:39-63,147` — จำนวนคูปองดึงจริงจาก `couponsApi.list()`
>   มี `cancelled` flag กัน setState หลัง unmount · กำลังโหลด/ล้มเหลว → `'--'`
> - เหรียญ + Flash Sale countdown ยังเป็นค่าตกแต่ง แต่ติด `// TODO(fake-data):` กำกับแล้วทั้ง 2 จุด
>   (`index.tsx:25`, `profile.tsx:135`) — ต้องมีระบบแต้ม/คอลัมน์เวลาจบโปรใน DB ก่อนถึงทำของจริงได้

<details><summary>รายละเอียดเดิม (เก็บไว้อ้างอิง)</summary>

| ที่ | ปัญหา | มีของจริงให้ใช้ไหม |
|---|---|---|
| `src/app/(tabs)/index.tsx:54` | ที่อยู่บน TopBar hardcode `"92 ถ.สุขุมวิท กรุงเทพฯ"` | ✅ มี `addressesApi.list()` + ฟิลด์ `isDefault` |
| `src/app/(tabs)/index.tsx:24` | `useCountdown(3*3600+23)` — Flash Sale นับถอยหลังจากเลขคงที่ รีเซ็ตใหม่ทุกครั้งที่เข้าหน้า | ❌ ไม่มีเวลาจบใน DB |
| `src/app/(tabs)/profile.tsx:105` | เหรียญ `1,240` hardcode | ❌ ไม่มีระบบแต้ม |
| `src/app/(tabs)/profile.tsx:115` | คูปอง `02` hardcode | ✅ มี `couponsApi.list()` |

**ข้อเสนอ:** ที่อยู่กับคูปองต่อของจริงได้เลย · ส่วนเหรียญกับ countdown ให้ตัดสินใจว่าจะ
(ก) เก็บไว้เป็นของตกแต่งแต่เขียนคอมเมนต์กำกับให้ชัด หรือ (ข) ตัดออก — **ต้องถามผู้ใช้ก่อน**

### Prompt สำหรับ Codex — ก้อนที่ 3 (เฉพาะส่วนที่ต่อของจริงได้)

```
บริบท: หน้า Home และ Profile แสดงข้อมูลปลอมที่ผู้ใช้เข้าใจผิดว่าเป็นของจริง
ทั้งที่มี API พร้อมใช้อยู่แล้ว

งานที่ 1 — ที่อยู่จัดส่งบนหัวหน้า Home
ไฟล์: src/app/(tabs)/index.tsx (บรรทัด 54 `address="92 ถ.สุขุมวิท กรุงเทพฯ"`)
- ดึงที่อยู่จริงด้วย addressesApi.list(token) ใน useFocusEffect ที่มีอยู่แล้ว
  (รวมกับการเรียก notificationsApi.list เดิม — ยิงพร้อมกันด้วย Promise.all)
- หาที่อยู่ที่ `isDefault === true` ถ้าไม่มีให้ใช้ตัวแรกในลิสต์
- ส่ง `address={ที่อยู่จริง}` โดยแสดงเป็น `${line1}` (TopBar มี numberOfLines={1} อยู่แล้ว)
- ถ้ายังไม่ล็อกอิน หรือยังไม่มีที่อยู่ → แสดง 'ยังไม่ได้ตั้งที่อยู่จัดส่ง'
- ทำให้แถบที่อยู่กดได้: TopBar variant="home" ยังไม่มี prop สำหรับกดกลางแถบ
  → เพิ่ม prop `onAddressPress?: () => void` ใน HomeProps แล้วครอบ styles.homeCenter
  ด้วย PressableScale เมื่อมี prop นี้ (ถ้าไม่ส่งมาให้ render View เหมือนเดิม)
  หน้า Home ส่ง `onAddressPress={() => router.push('/addresses')}`

งานที่ 2 — จำนวนคูปองในโปรไฟล์
ไฟล์: src/app/(tabs)/profile.tsx (บรรทัด 115 ค่า '02')
- ดึง couponsApi.list(token) มานับจำนวนจริง แสดงแบบเติม 0 ข้างหน้าให้เป็น 2 หลัก
  (เช่น 3 → '03', 12 → '12') ให้เข้ากับสไตล์ pixel เดิม
- ระหว่างโหลดให้แสดง '--'

งานที่ 3 — เหรียญกับ Flash Sale countdown (ยังไม่แก้ตรรกะ แค่กำกับให้ชัด)
- src/app/(tabs)/profile.tsx บรรทัด 105 (เหรียญ 1,240) และ
  src/app/(tabs)/index.tsx บรรทัด 24 (useCountdown ค่าคงที่)
- ยังไม่มีระบบแต้ม/เวลาจบโปรใน DB → ห้ามแก้ตรรกะ
- แค่เพิ่มคอมเมนต์ `// TODO(fake-data): ...` กำกับทั้ง 2 จุด อธิบายว่าเป็นค่าตกแต่ง
  และต้องมีอะไรใน backend ถึงจะทำของจริงได้

ขอบเขต: src/app/(tabs)/index.tsx, src/app/(tabs)/profile.tsx,
src/components/shop/top-bar.tsx (เฉพาะ HomeProps + homeCenter) เท่านั้น
❌ ห้ามแตะ server/ · ❌ ห้ามแก้ schema

กฎเหล็ก: ห้าม hardcode สี · PressableScale · ข้อความไทย · tsc --noEmit 0 error

เกณฑ์เสร็จ:
- tsc 0 error
- ล็อกอินแล้วหัวหน้า Home แสดงที่อยู่ default จริงจาก DB · กดแล้วไปหน้า /addresses
- ยังไม่มีที่อยู่ → ขึ้น 'ยังไม่ได้ตั้งที่อยู่จัดส่ง' ไม่ใช่ที่อยู่ปลอม
- จำนวนคูปองในโปรไฟล์ตรงกับจำนวนในหน้า /coupons
```

</details>

---

## ✅ ก้อนที่ 4 — ธีม/แจ้งเตือนโปรโมชันใช้งานจริง + ภาษาติดป้าย — **แก้แล้ว 2026-08-27**

- **ธีม** — ใช้ `LightBrand`/`DarkBrand` ผ่าน `ThemeProvider`, `useStyles(makeStyles)` และ `useBrand()`
  ครบทั้งแอป · รองรับสว่าง/มืด/ตามระบบ · บันทึกในเครื่องและ sync ค่าโปรไฟล์จาก DB
- **notifyPromo** — `auth-store` อัปเดต `user.settings` ทันทีและบันทึกผ่าน API · เมื่อปิดแล้ว
  notification ประเภท `promo` หายจากลิสต์และไม่นับในจุดแดงบน Home โดยไม่ต้อง refresh
- **ภาษา** — i18n จริงยกไปเฟสถัดไป · ชิปภาษา disabled และมีป้าย "เร็วๆ นี้" จึงไม่หลอกผู้ใช้

---

## ✅ ก้อนที่ 5 — เก็บกวาดเล็กน้อย — **แก้แล้ว 2026-08-13**

> `settings.tsx:64` logout → `/(auth)/welcome` · `auth-store.tsx` ย้าย `isAdminSession`
> เข้าใน `useMemo` · `paddingTop: 24` ย้ายเข้า StyleSheet ทั้ง login/register ·
> `Pressable` → `PressableScale` ครบ 9 จุด (เว้น backdrop/`stopPropagation` ไว้ถูกต้อง)
>
> **ยังเหลือ `Pressable` เปล่าอีก 8 จุดนอกขอบเขตก้อนนี้** (ปุ่มรอง ไม่ใช่ปุ่มพัง):
> `search.tsx:79,93` · `address-card.tsx:44,50` · `filter-sheet.tsx:110,123,145` ·
> `section-header.tsx:24` — เก็บทีหลังได้
> (ไม่นับ `checkbox.tsx` ที่มีแอนิเมชันของตัวเอง และ `collapsible.tsx` ที่ไม่มีหน้าไหนใช้)

<details><summary>รายละเอียดเดิม (เก็บไว้อ้างอิง)</summary>

| ไฟล์:บรรทัด | เรื่อง |
|---|---|
| `src/app/settings.tsx:57` | logout แล้วไป `/(auth)/login` ควรเป็น `/(auth)/welcome` (หน้า profile แก้ไปแล้ว ที่นี่ตกหล่น) |
| `src/store/auth-store.tsx:117` | `isAdminSession` คำนวณนอก `useMemo` — ทำงานถูก แต่ ESLint `exhaustive-deps` จะเตือน |
| `src/app/(auth)/login.tsx:69`, `register.tsx:61` | `paddingTop: 24` เป็น inline style ทั้งที่เป็นค่าคงที่แล้ว ควรย้ายเข้า StyleSheet |
| `cart.tsx:48,65` · `product/[id].tsx:65,140,170` · `products.tsx:100,110` · `settings.tsx:95,104,127` | ใช้ `Pressable` เปล่า ผิด **กฎเหล็กข้อ 4** (ต้องใช้ `PressableScale`) |

### Prompt สำหรับ Codex — ก้อนที่ 5

```
บริบท: งานเก็บกวาดเล็กๆ 4 เรื่อง ไม่มีการเปลี่ยนพฤติกรรมของแอป

1. src/app/settings.tsx บรรทัด 57 — เปลี่ยน router.replace('/(auth)/login')
   เป็น router.replace('/(auth)/welcome') ให้ตรงกับหน้า profile ที่แก้ไปแล้ว

2. src/store/auth-store.tsx บรรทัด 117 — ย้ายการคำนวณ isAdminSession เข้าไปไว้
   ข้างใน useMemo (คำนวณจาก user กับ sessionRole ที่อยู่ใน deps อยู่แล้ว)
   ห้ามเปลี่ยนตรรกะ ผลลัพธ์ต้องเหมือนเดิมทุกกรณี

3. src/app/(auth)/login.tsx บรรทัด 69 และ src/app/(auth)/register.tsx บรรทัด 61 —
   ย้าย `paddingTop: 24` จาก inline style เข้าไปใน styles.content แล้วลบ array style
   ที่เหลือตัวเดียวออก (เหลือ style={styles.content} เฉยๆ)

4. เปลี่ยน Pressable เปล่าเป็น PressableScale ตามกฎเหล็กข้อ 4 ในจุดเหล่านี้:
   - src/app/(tabs)/cart.tsx บรรทัด 48, 65
   - src/app/product/[id].tsx บรรทัด 65, 140, 170
   - src/app/products.tsx บรรทัด 100, 110
   - src/app/settings.tsx บรรทัด 95, 104, 127
   ⚠️ ยกเว้นที่ห้ามแตะ: Pressable ที่ทำหน้าที่เป็น modal backdrop หรือมี
   e.stopPropagation() (product/[id].tsx บรรทัด 243-244, delete-confirm-modal.tsx,
   confirm-modal.tsx) — พวกนี้ต้องเป็น Pressable เปล่าเท่านั้น
   ถ้า import Pressable ไม่ได้ใช้แล้วให้ลบออก

ขอบเขต: 6 ไฟล์ตามที่ระบุ ห้ามแตะไฟล์อื่น ห้ามเปลี่ยน layout หรือสไตล์
เกณฑ์เสร็จ: tsc --noEmit 0 error · หน้าตาแอปเหมือนเดิมทุกหน้า แค่กดปุ่มแล้วมีเอฟเฟกต์ย่อ
```

</details>

---

## 📌 ระบบที่ "ยังไม่มี" (ไม่ใช่ปุ่มตาย — เป็นฟีเจอร์ที่ยังไม่ได้ทำ)

ไม่ต้องรีบ แต่บันทึกไว้กันลืม:
- **ยกเลิกคำสั่งซื้อ** — `src/types/shop.ts` มีสถานะ `cancelled` แต่ `server/routes/orders.js`
  มีแค่ POST/GET/GET ไม่มี endpoint ยกเลิก และหน้า `orders/[id].tsx` ไม่มีปุ่ม
- **"อ่านทั้งหมด" ในหน้าแจ้งเตือน** — backend มี PATCH ทีละรายการเท่านั้น
- **อัปโหลดรูปสินค้า (แอดมิน)** — `admin/product-form.tsx` ให้พิมพ์ URL ทีละบรรทัด
  ยังไม่มีการอัปโหลดไฟล์จริง
- **ระบบแต้ม/เหรียญ** — ไม่มีตารางใน DB
- **เวลาจบ Flash Sale** — ไม่มีคอลัมน์ใน DB
