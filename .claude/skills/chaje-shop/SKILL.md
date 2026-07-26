---
name: chaje-shop
description: คู่มือพัฒนาแอป Chaje Electric (Expo SDK 57 + Expo Router + TypeScript) — API ของ component ที่ใช้ซ้ำได้ทั้ง 11 ตัว, design tokens, store API, และสูตรงานที่ทำบ่อย เรียกใช้เมื่อจะสร้างหน้าใหม่ แก้ UI เพิ่ม component ต่อ API หรือแตะโค้ดส่วนใดก็ตามในโปรเจกต์นี้ เพื่อไม่ต้องเปิดอ่านไฟล์ component ทีละตัว
---

# Chaje Electric — คู่มือพัฒนา

แอปขายเครื่องใช้ไฟฟ้า ภาษาไทย · Expo SDK 57 · Expo Router v57 (root = `src/app/`) · TypeScript strict

> อ่าน `PROGRESS.md` ก่อนเสมอเพื่อรู้ว่าอะไรเสร็จแล้ว · กฎรวมอยู่ใน `AGENTS.md` · แผนถัดไปอยู่ใน `Phase1.md`

---

## 1. Design tokens — `src/constants/theme.ts`

**ห้าม hardcode สีเด็ดขาด** import จากที่นี่เท่านั้น

```ts
import { Brand, Radius, AppFrameWidth } from '@/constants/theme';
```

| Token | ค่า | ใช้กับ |
|-------|-----|--------|
| `Brand.background` | `#FFFFFF` | พื้นหลังหน้า |
| `Brand.surface` | `#F7F7F7` | การ์ด, search bar, banner |
| `Brand.surfaceDeep` | `#ECECEC` | พื้นรูป / skeleton |
| `Brand.accent` | `#D6F26A` | ปุ่ม CTA (เขียวมะนาว) |
| `Brand.onAccent` | `#1A1A1A` | ตัวหนังสือบนปุ่ม accent |
| `Brand.text` | `#1A1A1A` | ข้อความหลัก |
| `Brand.textSecondary` | `#7A7A7A` | ข้อความรอง |
| `Brand.textMuted` | `#9A9A9A` | ข้อความจาง / ราคาขีดฆ่า |
| `Brand.successBg` / `successText` | `#EAF6E8` / `#3B6D11` | badge ประหยัดไฟ |
| `Brand.favoriteBg` / `favoriteIcon` | `#FCEBEB` / `#D4537E` | หัวใจ / wishlist |
| `Brand.divider` | `#EFEFEF` | เส้นแบ่ง (ใช้น้อยที่สุด) |
| `Brand.danger` | `#D64545` | สินค้าหมด |
| `Brand.notification` | `#E5484D` | จุดแดงแจ้งเตือน |
| `Brand.tabInactive` | `#B0B0B0` | ไอคอนแท็บที่ไม่ได้เลือก |

`Radius`: `sm:8` · `md:12` · `card:18` · `lg:20` · `pill:28` (ปุ่ม CTA)
`AppFrameWidth`: `480` — ความกว้างคอลัมน์มือถือบนเว็บจอกว้าง

**สไตล์รวม:** minimal ขาวสะอาด · การ์ดโค้งมน · ใช้พื้นผิวสีเทาแทนเส้นขอบ · ไม่ใช้ shadow หนัก ·
padding ในการ์ด 12–16 · ระยะห่าง section 20–24

---

## 2. Component API — `src/components/shop/`

**ห้ามเขียนใหม่ทับ** ทั้ง 11 ตัวพร้อมใช้งาน

### `PressableScale` — ใช้กับปุ่มที่กดได้ทุกปุ่ม
```tsx
<PressableScale onPress={fn} style={styles.x} activeScale={0.97}>...</PressableScale>
```
รับ props เหมือน `Pressable` ทุกตัว + `activeScale` (default 0.97, transition 150ms)

### `IconButton` — ปุ่มวงกลม
```tsx
<IconButton variant="surface" size={40} onPress={fn} showBadgeDot accessibilityLabel="ตั้งค่า">
  <Settings size={20} color={Brand.text} strokeWidth={1.75} />
</IconButton>
```
`variant`: `'surface'` (เทา) · `'floating'` (ขาวโปร่ง — ใช้ลอยบนรูป) · `'favorite'` (ชมพูอ่อน)
`showBadgeDot` = จุดแดงมุมขวาบน

### `Badge` — ป้าย pill
```tsx
<Badge label="ประหยัดไฟ 94%" tone="success" />
```
`tone`: `'success'` · `'accent'` · `'neutral'` · `'danger'`

### `ProductCard` — การ์ดสินค้า (กดแล้วไป `/product/{id}` อัตโนมัติ)
```tsx
<ProductCard product={product} variant="grid" index={i} />
```
`variant`: `'grid'` (การ์ดสูง 2 คอลัมน์) · `'row'` (แนวนอน รูปซ้าย)
`index` = ลำดับสำหรับ stagger animation
จัดการเองแล้ว: รูป, หัวใจ, ราคา+ราคาเดิมขีดฆ่า, badge สินค้าหมด (ลด opacity)

### `TopBar` — หัวหน้าจอ (union type เลือกตาม variant)
```tsx
// แบบ Home
<TopBar variant="home" address="92 ถ.สุขุมวิท กรุงเทพฯ" addressLabel="จัดส่งไปที่"
        hasNotification onSettings={fn} onNotification={fn} />

// แบบหน้า list/cart
<TopBar variant="list" title="ตะกร้าสินค้า" showBack showFilter onFilter={fn} onOptions={fn} />
```
จัดการ safe-area top ให้แล้ว ไม่ต้องใส่ padding เอง

### `FloatingHeader` — หัวลอยบนรูป (หน้า detail) — export จาก `top-bar.tsx`
```tsx
<FloatingHeader productId={product.id} />
```
มีปุ่ม back (ทำงานแล้ว) + หัวใจ (ทำงานแล้ว) + share (**ยังไม่มี handler**)

### `SkeletonImage` — รูป + fallback เทา
```tsx
<SkeletonImage uri={product.images[0]} style={styles.img} borderRadius={Radius.md} />
```
พื้นเทาแสดงตอนโหลด/โหลดไม่สำเร็จ/ไม่มี `uri` · จัดการ `onError` ให้แล้ว · ใช้ `contentFit="cover"`
⚠️ **ถ้าลืมส่ง `uri` จะเป็นกล่องเทาตลอด** (บั๊กที่เจอใน `cart.tsx:69`)

### `Checkbox`
```tsx
<Checkbox checked={bool} onToggle={fn} accessibilityLabel="เลือกทั้งหมด" />
```
22×22 มุมโค้ง 6 · ติ๊กแล้วพื้นเขียวมะนาว

### `QuantityStepper`
```tsx
<QuantityStepper quantity={n} onChange={(next) => ...} min={1} max={99} />
```
`min={0}` จะทำให้ลดถึง 0 ได้ (ใช้ลบสินค้าออกจากตะกร้า)

### `CategoryIcon`
```tsx
<CategoryIcon name={cat.icon} label={cat.name} onPress={fn} />
```
`name` เป็น `CategoryIconName`: `airVent`·`refrigerator`·`tv`·`washingMachine`·`fan`·`cookingPot`·`microwave`·`grid`

### `SectionHeader`
```tsx
<SectionHeader title="ลดกระหน่ำ" badge="02:59:23" onSeeAll={fn} seeAllLabel="ดูทั้งหมด" />
```

### `HeartButton`
```tsx
<HeartButton productId={id} size={22} withBackground />
```
ผูกกับ `useShop()` แล้ว toggle เอง + มี micro-bounce animation

---

## 3. Store API

### `useCatalog()` — `src/store/catalog-store.tsx`
```ts
const {
  products,              // Product[]
  categories,            // Category[]
  loading, error,        // สถานะ fetch
  isRemote,              // true = ดึงจาก GitHub สำเร็จ
  getProductById,        // (id) => Product | undefined
  getProductsByCategory, // (categoryId) => Product[]
  flashSaleProducts,     // Product[] (isFlashSale = true)
  recommendedProducts,   // Product[] (isFlashSale = false)
} = useCatalog();
```
**ข้อมูลพร้อมใช้ตั้งแต่ render แรก** (bundled JSON เป็นค่าเริ่มต้น แล้วค่อยดึง remote มาทับ)
→ ไม่ต้องเขียน loading guard สำหรับข้อมูลสินค้า

### `useShop()` — `src/store/shop-store.tsx`
```ts
const {
  cart,                // CartItem[]
  cartCount,           // จำนวนรวม (ใช้กับ badge แท็บ)
  selectedTotal,       // ยอดรวมเฉพาะที่ติ๊ก
  favorites,           // Set<string>
  addToCart, removeFromCart, setQuantity,
  toggleCartSelected, setAllSelected,
  isFavorite, toggleFavorite,
} = useShop();
```
⚠️ ตอนนี้อยู่ใน memory — **refresh แล้วหาย** (Phase 2 จะ sync กับ server)

### Provider order — `src/app/_layout.tsx`
`GestureHandlerRootView > CatalogProvider > ShopProvider > frame(maxWidth 480 บนเว็บ) > Stack`
เพิ่ม provider ใหม่ให้วางตามลำดับ dependency

---

## 4. Types — `src/types/product.ts`

```ts
Product   { id, name, categoryId, price, originalPrice?, images[], description,
            rating, reviewCount, energySavingPercent?, inStock, isFlashSale?,
            installmentPerMonth?, specs{power,suitableRoom,warranty}, branchStock[] }
Category  { id, name, icon: CategoryIconName }
CartItem  { product, quantity, selected }
BranchStock { id, name, inStock }
```
⚠️ **ยังไม่มี field `brand`** — ตัวกรอง "ยี่ห้อ" ใน `products.tsx` เลยต้อง sort ตามชื่อแทน

---

## 5. Utils

```ts
import { formatBaht, formatCountdown } from '@/utils/format';
formatBaht(12900)      // "฿12,900"
formatCountdown(10823) // "03:00:23"
```
**ห้ามเขียนฟังก์ชัน format ใหม่**

```ts
import { useCountdown } from '@/hooks/use-countdown';
const seconds = useCountdown(3 * 3600); // นับถอยหลังทุกวินาที
```

---

## 6. สูตรงานที่ทำบ่อย

### สร้างหน้าใหม่
1. สร้างไฟล์ใน `src/app/` (ชื่อไฟล์ = route เช่น `settings.tsx` → `/settings`)
2. โครงมาตรฐาน:
```tsx
export default function XScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: Brand.background }}>
      <TopBar variant="list" title="ชื่อหน้า" showBack />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16,
                                           paddingBottom: insets.bottom + 24 }}>
        ...
      </ScrollView>
    </View>
  );
}
```
3. ถ้าเป็นหน้าที่ push ทับ tabs → ลงทะเบียนใน `<Stack>` ที่ `src/app/_layout.tsx`

### เพิ่มปุ่ม CTA (เขียวมะนาว pill)
```tsx
<PressableScale style={{ backgroundColor: Brand.accent, borderRadius: Radius.pill,
                         paddingVertical: 16, alignItems: 'center' }} onPress={fn}>
  <Text style={{ fontSize: 16, fontWeight: '700', color: Brand.onAccent }}>ข้อความ</Text>
</PressableScale>
```

### ปุ่ม sticky ด้านล่างจอ
```tsx
<View style={{ position:'absolute', left:0, right:0, bottom:0,
               backgroundColor: Brand.background, borderTopWidth:1,
               borderTopColor: Brand.divider, paddingHorizontal:20,
               paddingTop:12, paddingBottom: insets.bottom + 12 }}>
```
แล้วให้ ScrollView มี `contentContainerStyle={{ paddingBottom: 140 }}` กันโดนบัง

### list ยาว → ใช้ `FlatList`
grid 2 คอลัมน์: `numColumns={2}` + `columnWrapperStyle={{ gap:12, marginBottom:12 }}`
เนื้อหาส่วนบน (banner/หมวดหมู่) ใส่ใน `ListHeaderComponent` เพื่อ performance

### ไอคอน
```tsx
import { Search, Heart } from 'lucide-react-native';
<Search size={20} color={Brand.text} strokeWidth={2} />
```
ขนาดมาตรฐาน: ในปุ่มวงกลม 18–22 · แท็บล่าง 23 · หมวดหมู่ 24

---

## 7. ข้อมูล & การเชื่อมต่อ

- ข้อมูลสินค้าอยู่ที่ `src/data/products.json` (12 ตัว) + `categories.json` (7 หมวด)
- อัปโหลดบน GitHub: `Tharatap/App_internet_programming_3-1` branch `master` path `src/data/`
- ตั้งค่าที่ `src/config.ts` (`GITHUB_USER` / `GITHUB_REPO` / `GITHUB_BRANCH` / `USE_REMOTE_DATA`)
- ลำดับ fallback: **GitHub raw → JSON ใน bundle** (แอปไม่มีทางว่างข้อมูล)
- แก้ข้อมูลสินค้า = แก้ JSON แล้ว push ขึ้น GitHub (ไม่ต้องแก้โค้ด)

---

## 8. รัน / ทดสอบ

```bash
npx expo start --web       # เว็บ → F12 → Ctrl+Shift+M ดูเป็นมือถือ
npx expo start --web -c    # ล้าง cache (ใช้เมื่อแก้ config แล้วไม่อัปเดต)
npx expo start             # แล้วกด a=Android · i=iOS · w=web · สแกน QR = Expo Go
npx tsc --noEmit           # ต้อง 0 error ก่อนบอกว่างานเสร็จ
```

**ข้อควรรู้บนเว็บ:** ลากเมาส์ปัดแนวนอน (gallery) ไม่ได้ → ใช้ **Shift + scroll** แทน
บนมือถือจริงปัดได้ปกติ

---

## 9. เช็คลิสต์ก่อนบอกว่า "เสร็จ"

- [ ] `npx tsc --noEmit` ผ่าน 0 error
- [ ] ไม่มีสี hardcode (ใช้ `Brand` / `Radius` ทั้งหมด)
- [ ] ปุ่มที่กดได้ใช้ `PressableScale` และมี `accessibilityLabel`
- [ ] ข้อความ UI เป็นภาษาไทย
- [ ] ไม่มีปุ่มไหนเป็น `onPress={() => {}}` ค้างไว้
- [ ] **อัปเดต `PROGRESS.md`** แล้ว
