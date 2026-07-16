# รายงานโค้ด UI แอป Chaje Electric — 3 ส่วนหลัก

เอกสารนี้รวมโค้ดของ 3 ส่วนที่แสดงในภาพหน้าจอ พร้อมคำอธิบายว่าโค้ดแต่ละส่วนทำหน้าที่อะไร

| ส่วน | ชื่อ | ไฟล์โค้ด |
|------|------|----------|
| ① | เมนูด้านบน (Header / Top Bar) | `src/components/shop/top-bar.tsx` |
| ② | หน้ารายละเอียดสินค้า (Product Detail) | `src/app/product/[id].tsx` |
| ③ | เมนูด้านล่าง (Bottom Tab Bar) | `src/app/(tabs)/_layout.tsx` |

---

## ① เมนูด้านบน (Header / Top Bar)

**ไฟล์:** `src/components/shop/top-bar.tsx`

ส่วนหัวสีขาวด้านบนของหน้า Home ประกอบด้วย ปุ่มตั้งค่า (ซ้าย), ที่อยู่จัดส่ง (กลาง),
และปุ่มกระดิ่งแจ้งเตือนที่มีจุดแดง (ขวา)

```tsx
// ===== เมนูด้านบน (Header) แบบหน้า Home =====
// props.variant === 'home' คือรูปแบบหัวของหน้าแรก
if (props.variant === 'home') {
  return (
    <View style={[styles.container, { paddingTop }]}>

      {/* (ซ้าย) ปุ่มวงกลม "ตั้งค่า" พื้นหลังสีชมพูอ่อน */}
      <IconButton variant="favorite" onPress={props.onSettings} accessibilityLabel="ตั้งค่า">
        <Settings size={20} color={Brand.text} strokeWidth={1.75} />
      </IconButton>

      {/* (กลาง) ที่อยู่จัดส่ง — บรรทัดบน "จัดส่งไปที่" + บรรทัดล่างเป็นที่อยู่ */}
      <View style={styles.homeCenter}>
        <View style={styles.addressLabelRow}>
          <MapPin size={12} color={Brand.textSecondary} strokeWidth={2} />
          <Text style={styles.addressLabel}>{props.addressLabel ?? 'จัดส่งไปที่'}</Text>
        </View>
        <Text style={styles.address} numberOfLines={1}>
          {props.address}
        </Text>
      </View>

      {/* (ขวา) ปุ่มกระดิ่งแจ้งเตือน — showBadgeDot = true จะโชว์จุดแดง */}
      <IconButton
        onPress={props.onNotification}
        showBadgeDot={props.hasNotification}
        accessibilityLabel="การแจ้งเตือน">
        <Bell size={20} color={Brand.text} strokeWidth={1.75} />
      </IconButton>

    </View>
  );
}
```

**การนำไปใช้ในหน้า Home** (`src/app/(tabs)/index.tsx`):

```tsx
<TopBar
  variant="home"
  address="92 ถ.สุขุมวิท กรุงเทพฯ"
  hasNotification            // มีแจ้งเตือนใหม่ => โชว์จุดแดงบนกระดิ่ง
/>
```

> หมายเหตุ: ปุ่มวงกลมทุกปุ่มใช้ component `IconButton`
> (`src/components/shop/icon-button.tsx`) ซึ่งกดแล้วย่อเล็กน้อย (animation)

---

## ② หน้ารายละเอียดสินค้า (Product Detail)

**ไฟล์:** `src/app/product/[id].tsx`

หน้าที่เปิดเมื่อผู้ใช้กดการ์ดสินค้า แสดงรูปใหญ่ (ปัดดูได้หลายรูป), ชื่อ, คะแนนรีวิว,
การ์ดราคา, สเปค, สต๊อกตามสาขา และปุ่ม "เพิ่มลงตะกร้า" ที่ตรึงอยู่ด้านล่าง

```tsx
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();  // รับ id สินค้าจาก URL
  const { addToCart } = useShop();                        // ฟังก์ชันเพิ่มลงตะกร้า
  const [page, setPage] = useState(0);                    // หน้ารูปที่กำลังดู (dots)
  const product = getProductById(id);                     // ดึงข้อมูลสินค้าจาก mock

  // จำนวนหน้าแกลเลอรี = จำนวนรูปจริงของสินค้า (อย่างน้อย 1)
  const galleryPages = Math.max(product.images.length, 1);

  return (
    <View style={styles.screen}>
      {/* Header ลอยบนรูป: ปุ่ม back (ซ้าย) + หัวใจ/แชร์ (ขวา) */}
      <FloatingHeader productId={product.id} />

      <ScrollView>
        {/* ===== แกลเลอรีรูปสินค้า (เลื่อนซ้าย-ขวาได้) ===== */}
        <View>
          <ScrollView horizontal pagingEnabled onScroll={onGalleryScroll}>
            {Array.from({ length: galleryPages }).map((_, i) => (
              <SkeletonImage key={i} uri={product.images[i]} style={styles.galleryImage} />
            ))}
          </ScrollView>
          {/* จุดบอกตำแหน่งรูป (pagination dots) */}
          <View style={styles.dots}>
            {Array.from({ length: galleryPages }).map((_, i) => (
              <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
            ))}
          </View>
        </View>

        <View style={styles.body}>
          {/* ชื่อสินค้า */}
          <Text style={styles.name}>{product.name}</Text>

          {/* แถว badge: คะแนนรีวิว (ดาว) + ป้ายประหยัดไฟ */}
          <View style={styles.badgeRow}>
            <View style={styles.ratingBadge}>
              <Star size={13} color="#F5A623" fill="#F5A623" />
              <Text>{product.rating.toFixed(1)} ({product.reviewCount})</Text>
            </View>
            <Badge label={`ประหยัดไฟ ${product.energySavingPercent}%`} tone="success" />
          </View>

          {/* การ์ดราคา: ราคาปัจจุบัน + ราคาเดิมขีดฆ่า + ยอดผ่อน/เดือน */}
          <View style={styles.priceCard}>
            <Text style={styles.price}>{formatBaht(product.price)}</Text>
            <Text style={styles.originalPrice}>{formatBaht(product.originalPrice)}</Text>
          </View>

          {/* สเปคสินค้า: กำลังไฟ / ขนาดห้อง / การรับประกัน */}
          {/* สต๊อกตามสาขา: วนแสดงแต่ละสาขาพร้อมไอคอน ✓ (มีของ) หรือ ✗ (หมด) */}
        </View>
      </ScrollView>

      {/* ===== ปุ่ม "เพิ่มลงตะกร้า" ตรึงด้านล่างจอ (sticky) ===== */}
      <View style={styles.sticky}>
        <PressableScale
          style={styles.cartButton}
          onPress={() => {
            addToCart(product);            // เพิ่มสินค้าลงตะกร้า
            router.push('/(tabs)/cart');   // ไปหน้าตะกร้า
          }}>
          <Text style={styles.cartButtonText}>เพิ่มลงตะกร้า</Text>
        </PressableScale>
        {/* วันที่จัดส่งใต้ปุ่ม */}
        <Text style={styles.deliveryText}>จัดส่งวันที่ 26 ก.ค.</Text>
      </View>
    </View>
  );
}
```

> หมายเหตุ: เลื่อนรูปในแกลเลอรีจะอัปเดตตัวแปร `page` เพื่อไฮไลต์จุด (dot) ที่ตรงกับรูปปัจจุบัน

---

## ③ เมนูด้านล่าง (Bottom Tab Bar)

**ไฟล์:** `src/app/(tabs)/_layout.tsx`

แถบเมนู 5 แท็บด้านล่างสุด: หน้าแรก / หมวดหมู่ / ตะกร้า / โปรด / โปรไฟล์
โดยแท็บ "ตะกร้า" มีป้ายตัวเลข (badge) บอกจำนวนสินค้าในตะกร้า

```tsx
export default function TabsLayout() {
  const { cartCount } = useShop();  // จำนวนสินค้าในตะกร้า (ไว้โชว์ badge)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Brand.text,        // สีแท็บที่เลือก (เข้ม)
        tabBarInactiveTintColor: Brand.tabInactive, // สีแท็บที่ไม่ได้เลือก (เทา)
        tabBarStyle: {
          backgroundColor: Brand.background,
          borderTopColor: Brand.divider,
          borderTopWidth: 1,
        },
      }}>

      {/* แท็บ 1: หน้าแรก */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'หน้าแรก',
          tabBarIcon: ({ color }) => <House size={23} color={color} />,
        }}
      />

      {/* แท็บ 2: หมวดหมู่ */}
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'หมวดหมู่',
          tabBarIcon: ({ color }) => <LayoutGrid size={23} color={color} />,
        }}
      />

      {/* แท็บ 3: ตะกร้า — มี badge ตัวเลขจำนวนสินค้า */}
      <Tabs.Screen
        name="cart"
        options={{
          title: 'ตะกร้า',
          tabBarBadge: cartCount > 0 ? cartCount : undefined,  // โชว์เลขเมื่อมีสินค้า
          tabBarIcon: ({ color }) => <ShoppingCart size={23} color={color} />,
        }}
      />

      {/* แท็บ 4: รายการโปรด */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'โปรด',
          tabBarIcon: ({ color }) => <Heart size={23} color={color} />,
        }}
      />

      {/* แท็บ 5: โปรไฟล์ */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'โปรไฟล์',
          tabBarIcon: ({ color }) => <User size={23} color={color} />,
        }}
      />
    </Tabs>
  );
}
```

> หมายเหตุ:
> - ไอคอนทั้งหมดมาจากไลบรารี `lucide-react-native`
> - ตัวเลขบน badge (เช่น เลข 3) มาจาก `cartCount` ใน `src/store/shop-store.tsx`
>   ซึ่งจะเพิ่มขึ้นอัตโนมัติเมื่อกด "เพิ่มลงตะกร้า"

---

## สรุปความสัมพันธ์ของไฟล์

```
src/
├── app/                          ← "หน้าจอ" (screens) ตาม routing
│   ├── (tabs)/
│   │   ├── _layout.tsx           ← ③ เมนูด้านล่าง (Bottom Tab)
│   │   └── index.tsx             ← หน้า Home (เรียกใช้ ① TopBar)
│   └── product/[id].tsx          ← ② หน้ารายละเอียดสินค้า
│
├── components/shop/              ← "ชิ้นส่วนใช้ซ้ำ" (reusable components)
│   ├── top-bar.tsx               ← ① เมนูด้านบน (Header)
│   ├── icon-button.tsx           ← ปุ่มวงกลมในหัว
│   ├── product-card.tsx          ← การ์ดสินค้า (กดเข้าหน้า Detail)
│   └── ...
│
└── store/shop-store.tsx          ← เก็บข้อมูลตะกร้า/รายการโปรด (จำนวน badge)
```
