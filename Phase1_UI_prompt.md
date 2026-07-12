สร้าง Frontend สำหรับแอป React Native (Expo Router, TypeScript) 
เป็นแอปขายเครื่องใช้ไฟฟ้า ชื่อแอป "[Chaje Electric]"

โครงสร้าง project มีอยู่แล้วที่ src/components (มี ThemedView, ThemedText, 
external-link component) ให้ต่อยอดจากของเดิม อย่าสร้างโครงสร้างใหม่ทับ

ทำเฉพาะ Phase 1: ยังไม่ต้องต่อ backend/API ใช้ mock data (mockProducts.ts, 
mockCategories.ts) ให้ครบ type ที่ชัดเจนด้วย TypeScript interface

=== DESIGN SYSTEM ===

สไตล์: minimal, clean, ขาวสะอาด การ์ดโค้งมน เว้นระยะเยอะ ไม่มีเส้นขอบหนา 
ใช้พื้นผิวสีเทาอ่อนแทนเส้นขอบ ปุ่มหลักเป็นสีเขียวมะนาวสดโค้งมนเต็ม (pill shape)

Colors:
- Background หลัก: #FFFFFF
- Surface รอง (การ์ด, search bar, banner): #F7F7F7
- Accent หลัก (ปุ่ม CTA): #D6F26A (lime green)
- ข้อความหลัก: #1A1A1A
- ข้อความรอง: #7A7A7A / #9A9A9A
- Success/ประหยัดไฟ badge: background #EAF6E8, text #3B6D11
- Favorite/wishlist accent: background #FCEBEB, icon #D4537E
- เส้นแบ่งบางๆ: #EFEFEF (ใช้น้อยที่สุด เน้นพื้นผิวสีแทนเส้น)

Typography:
- ใช้ font system default (San Francisco / Roboto)
- หัวข้อสินค้า/ชื่อหน้า: 16-18px, weight 500-600
- ราคา: 16-18px, weight 600, สีเข้ม #1A1A1A
- ราคาก่อนลด (ถ้ามี): ตัวเล็กกว่า, สีเทาอ่อน, ขีดฆ่า (line-through)
- ข้อความรอง/คำอธิบาย: 12-13px, สีเทา #7A7A7A

Spacing & Shape:
- Border radius การ์ด: 16-20px
- Border radius ปุ่ม CTA: เต็ม (pill, 24-28px)
- Border radius icon button วงกลม: 50% (circle), ขนาด 36-40px
- Padding ภายในการ์ด: 12-16px
- ระยะห่างระหว่าง section: 20-24px
- ไม่ใช้ shadow หนักๆ ใช้พื้นผิวสีต่างระดับแทน (#FFF บน #F7F7F7)

Animation/Interaction:
- ปุ่มกด: scale down เล็กน้อย (0.97) พร้อม transition 150-200ms ตอนกด
- การ์ดสินค้าตอน list โหลด: fade + slide up แบบ stagger เล็กน้อย (delay ทีละใบ 50-80ms)
- เปลี่ยนหน้า (navigation): ใช้ default slide transition ของ expo-router
- Skeleton loading placeholder สีเทาอ่อนระหว่างโหลดรูปภาพ (แทนกระพริบขาวดำ)
- Heart icon (wishlist): เปลี่ยนสีและมี micro-bounce animation ตอนกด toggle

=== หน้าที่ต้องสร้าง (Phase 1) ===

1. Top Bar (Header component, reusable)
   - แบบ Home: ปุ่มวงกลม settings ซ้าย, ที่อยู่/ชื่อร้านตรงกลาง, ปุ่มวงกลม 
     notification ขวา (มี badge จุดแดงถ้ามีแจ้งเตือนใหม่)
   - แบบ Detail page: ปุ่มวงกลม back ซ้าย, ปุ่มวงกลม heart + share ขวา 
     ลอยอยู่บนรูปสินค้า (พื้นหลังโปร่งแสงขาว)
   - แบบ list/cart page: ชื่อหน้าชิดซ้าย ตัวหนา, ปุ่ม option (...) ขวา

2. Bottom Tab Navigation (expo-router Tabs, 5 แท็บ)
   - หน้าแรก (Home) / หมวดหมู่ (Catalog) / ตะกร้า (Cart, มี badge ตัวเลข) / 
     รายการโปรด (Favorites) / โปรไฟล์ (Profile)
   - ไอคอนใช้ lucide-react-native หรือ expo-symbols, ขนาด 22-24px
   - Active tab: สีเข้ม #1A1A1A หรือเขียวเข้ม, Inactive: เทาอ่อน #B0B0B0
   - ไม่มีพื้นหลังไฮไลต์หลังไอคอน active เอาแค่สีเปลี่ยน (minimal)

3. หน้า Home
   - Header ตามข้อ 1
   - Search bar โค้งมนเต็ม พื้นหลังเทาอ่อน มี icon แว่นขยายซ้าย, placeholder 
     "ค้นหาสินค้าเครื่องใช้ไฟฟ้า"
   - Promo banner การ์ดมุมโค้ง พื้นหลังพาสเทล (เขียวอ่อน) พร้อม icon ปลั๊กไฟ/
     ประหยัดไฟ และ badge เปอร์เซ็นต์ส่วนลดค่าส่ง
   - Section "หมวดหมู่": แถวไอคอนวงกลมเลื่อนแนวนอน (แอร์, ตู้เย็น, ทีวี, 
     เครื่องซักผ้า, พัดลม, หม้อหุงข้าว) พร้อมลิงก์ "ดูทั้งหมด"
   - Section "ลดกระหน่ำ" (Flash Sale): มี countdown timer badge, grid สินค้า 
     2 คอลัมน์ แสดงราคาลด+ราคาเดิมขีดฆ่า, ปุ่ม heart มุมขวาบนการ์ด
   - Section "แนะนำสำหรับคุณ": grid สินค้าต่อเนื่อง infinite scroll ได้

4. หน้า Product List (เมื่อกดหมวดหมู่/ค้นหา)
   - Header แบบ list พร้อมปุ่ม filter/sort มุมขวา
   - แถบ filter chips โค้งมนเต็ม (แนะนำ/ราคา/ยี่ห้อ/ประหยัดไฟ) เลื่อนแนวนอนได้
   - Layout เป็น list แนวนอน (รูปเล็กซ้าย, รายละเอียดขวา) หรือ grid 2 คอลัมน์ 
     ก็ได้ (ให้ Claude Code เลือก layout ที่ implement ง่ายกว่า)
   - แต่ละรายการ: รูป, ชื่อสินค้า, badge "ประหยัดไฟเบอร์ 5", ราคา, 
     สถานะสต๊อก (ใช้ opacity ลดลงเมื่อสินค้าหมด + label สีแดง)

5. หน้า Product Detail ⭐ (สำคัญที่สุด)
   - รูปสินค้าใหญ่ พื้นหลังเทาอ่อน มี pagination dots ด้านล่างรูป (เลื่อนดู
     หลายรูปได้)
   - ปุ่มวงกลม back (ซ้ายบน), heart กับ share (ขวาบน) ลอยบนรูป
   - ชื่อสินค้า (ตัวหนา), แถว badge: คะแนนรีวิว (icon ดาว + ตัวเลข + จำนวนรีวิว) 
     และ badge "ประหยัดไฟ XX%" พื้นเขียวอ่อน
   - การ์ดราคา พื้นหลังเทาอ่อนมุมโค้ง: ราคาเต็มตัวหนา + ข้อความผ่อนชำระต่อเดือน 
     + ปุ่ม info icon
   - คำอธิบายสินค้าสั้นๆ พร้อมลิงก์ "อ่านเพิ่มเติม"
   - สเปคสินค้า: กำลังไฟ (วัตต์), ขนาดที่เหมาะสม, การรับประกัน (แสดงแบบ 
     key-value เรียบง่าย ไม่ต้องเป็นตาราง)
   - Section "สต๊อกตามสาขา": list สาขาพร้อม icon check (มีของ) หรือ x (หมด)
   - ปุ่ม "เพิ่มลงตะกร้า" สีเขียวมะนาว โค้งมนเต็ม แบบ sticky ด้านล่างจอ 
     พร้อมข้อความวันที่จัดส่งใต้ปุ่ม

6. หน้า Cart (ตะกร้าสินค้า)
   - Header "ตะกร้าสินค้า" พร้อมปุ่ม option
   - แถบที่อยู่จัดส่งด้านบน (พื้นเทาอ่อน, icon pin, กดแล้วไปหน้าเลือกที่อยู่)
   - Checkbox "เลือกทั้งหมด" (สี่เหลี่ยมมุมโค้งเล็ก พื้นเขียวมะนาวเมื่อ checked)
   - รายการสินค้าในตะกร้า: checkbox, รูปเล็ก, ชื่อ+ราคา, ตัวนับจำนวน (ปุ่ม 
     วงกลม −/+ ซ้ายขวาตัวเลข)
   - ปุ่ม "ชำระเงิน" sticky ด้านล่าง สีเขียวมะนาว โค้งมนเต็ม

=== ไฟล์/โครงสร้างที่ต้องการ ===

- แยก mock data ไว้คนละไฟล์: src/data/mockProducts.ts, mockCategories.ts
- แยก type: src/types/product.ts (Product, Category, CartItem interface)
- Component ที่ควร reusable: ProductCard, CategoryIcon, TopBar, 
  BottomTabBar (ถ้า custom เพิ่มจาก default), Badge, QuantityStepper
- ใช้ FlatList/ScrollView ที่เหมาะสมสำหรับ list ยาว เพื่อ performance

ให้เขียนโค้ดทีละหน้า เริ่มจาก Home ก่อน แล้วค่อยทำ Product List, 
Product Detail, Cart ตามลำดับ เพื่อให้ทดสอบทีละส่วนได้