-- ============================================================
--  Chaje Electric — ข้อมูลตั้งต้น (seed)
--  สร้างอัตโนมัติจาก src/data/products.json + categories.json
--
--  วิธีใช้: รัน schema.sql ให้เสร็จก่อน แล้วค่อยวางไฟล์นี้
--          phpMyAdmin → DB ip_std6730202645 → แท็บ SQL → วาง → Go
--  หมายเหตุ: รันซ้ำได้ (ล้างข้อมูลเดิมก่อนเสมอ)
-- ============================================================

SET NAMES utf8mb4;

-- ล้างข้อมูลเดิมเพื่อให้รันซ้ำได้ (ไม่แตะตาราง users/orders)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE product_images;
TRUNCATE TABLE product_branch_stock;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
SET FOREIGN_KEY_CHECKS = 1;

-- ---------- หมวดหมู่ (7 รายการ) ----------
INSERT INTO categories (id, name, icon) VALUES
  ('air', 'แอร์', 'airVent'),
  ('fridge', 'ตู้เย็น', 'refrigerator'),
  ('tv', 'ทีวี', 'tv'),
  ('washer', 'เครื่องซักผ้า', 'washingMachine'),
  ('fan', 'พัดลม', 'fan'),
  ('ricecooker', 'หม้อหุงข้าว', 'cookingPot'),
  ('microwave', 'ไมโครเวฟ', 'microwave');

-- ---------- สินค้า (12 รายการ) ----------
INSERT INTO products
  (id, name, category_id, brand, price, original_price, description,
   rating, review_count, energy_saving_percent, in_stock, is_flash_sale,
   installment_per_month, spec_power, spec_suitable_room, spec_warranty)
VALUES
  ('p1', 'แอร์ Inverter 12000 BTU', 'air', 'Samsung', 12900, 15900, 'แอร์ระบบ Inverter ประหยัดไฟ ทำความเย็นเร็ว เหมาะกับห้อง 18–20 ตร.ม. พร้อมระบบฟอกอากาศ PM2.5 และควบคุมผ่านแอปได้', 4.8, 117, 94, 1, 1, 1075, '1,180 วัตต์', '18–20 ตร.ม.', 'คอมเพรสเซอร์ 10 ปี'),
  ('p2', 'แอร์ Inverter 9000 BTU', 'air', 'Electrolux', 10900, 13900, 'แอร์ Inverter ขนาดกะทัดรัด เหมาะกับห้องนอน 13–15 ตร.ม. เสียงเงียบ ประหยัดไฟเบอร์ 5', 4.7, 89, 90, 1, 1, 909, '920 วัตต์', '13–15 ตร.ม.', 'คอมเพรสเซอร์ 10 ปี'),
  ('p3', 'หม้อทอดไร้น้ำมัน 5L', 'ricecooker', 'Electrolux', 1290, 1990, 'หม้อทอดไร้น้ำมันความจุ 5 ลิตร ทอดกรอบด้วยลมร้อน ลดไขมันสูงสุด 85%', 4.6, 203, 70, 1, 1, NULL, '1,500 วัตต์', 'ครัวทั่วไป', 'สินค้า 2 ปี'),
  ('p4', 'ตู้เย็น 2 ประตู 7.4 คิว', 'fridge', 'Electrolux', 8990, 10900, 'ตู้เย็น 2 ประตูระบบ No Frost ไม่มีน้ำแข็งเกาะ ช่องแช่ผักความชื้นสูง', 4.5, 64, 85, 1, 0, 749, '95 วัตต์', '2–3 คน', 'คอมเพรสเซอร์ 10 ปี'),
  ('p5', 'สมาร์ททีวี 4K 55 นิ้ว', 'tv', 'Philips', 13900, 17900, 'Smart TV 4K UHD 55 นิ้ว ระบบ Android TV รองรับ Netflix, YouTube ในตัว', 4.7, 152, 80, 1, 0, 1159, '120 วัตต์', 'ห้องนั่งเล่น', 'สินค้า 3 ปี'),
  ('p6', 'เครื่องซักผ้าฝาบน 12 กก.', 'washer', 'Samsung', 7490, NULL, 'เครื่องซักผ้าฝาบน 12 กก. ระบบ Inverter เงียบ ประหยัดน้ำ 11 โปรแกรมซัก', 4.4, 41, 78, 0, 0, 624, '420 วัตต์', 'ครอบครัว 4–5 คน', 'มอเตอร์ 10 ปี'),
  ('p7', 'พัดลมตั้งพื้น 16 นิ้ว', 'fan', 'Hatari', 690, 990, 'พัดลมตั้งพื้น 16 นิ้ว ปรับระดับได้ 3 สปีด ส่ายอัตโนมัติ มอเตอร์ทองแดงแท้', 4.3, 310, 65, 1, 0, NULL, '55 วัตต์', 'ห้องทั่วไป', 'มอเตอร์ 3 ปี'),
  ('p8', 'หม้อหุงข้าวดิจิทัล 1.8L', 'ricecooker', 'Sharp', 1490, NULL, 'หม้อหุงข้าวดิจิทัล 1.8 ลิตร ระบบ Fuzzy Logic หุงได้หลายเมนู ตั้งเวลาล่วงหน้า', 4.6, 98, 72, 1, 0, NULL, '860 วัตต์', '4–6 คน', 'สินค้า 2 ปี'),
  ('p9', 'ไมโครเวฟ 25 ลิตร', 'microwave', 'Electrolux', 2390, 2990, 'ไมโครเวฟ 25 ลิตร ระบบกริลล์ 900 วัตต์ 10 ระดับกำลังไฟ จานหมุนกระจก', 4.5, 57, 68, 1, 0, NULL, '900 วัตต์', 'ครัวทั่วไป', 'สินค้า 2 ปี'),
  ('p10', 'ตู้เย็นมินิบาร์ 3.2 คิว', 'fridge', 'Electrolux', 4290, 5290, 'ตู้เย็นมินิบาร์ประตูเดียว 3.2 คิว เหมาะกับหอพัก ออฟฟิศ ประหยัดพื้นที่', 4.2, 26, 82, 1, 0, NULL, '75 วัตต์', '1–2 คน', 'คอมเพรสเซอร์ 5 ปี'),
  ('p11', 'สมาร์ททีวี 4K 43 นิ้ว', 'tv', 'Philips', 8990, 11900, 'Smart TV 4K 43 นิ้ว รองรับ HDR10 เชื่อมต่อไร้สาย มีช่อง HDMI 3 พอร์ต', 4.4, 73, 79, 1, 0, 749, '95 วัตต์', 'ห้องนอน', 'สินค้า 3 ปี'),
  ('p12', 'พัดลมไอเย็น 8 ลิตร', 'fan', 'Hatari', 1990, 2590, 'พัดลมไอเย็นถังน้ำ 8 ลิตร เพิ่มความชื้น เย็นสบาย 3 สปีด พร้อมรีโมท', 4.1, 44, 60, 1, 0, NULL, '80 วัตต์', '15–20 ตร.ม.', 'สินค้า 1 ปี');

-- ---------- รูปสินค้า ----------
INSERT INTO product_images (product_id, url, sort_order) VALUES
  ('p1', 'https://images.samsung.com/is/image/samsung/th-arxxtyhzcwk-f-ar13tyhzcwkn-White-218666952?$1164_776_PNG$', 0),
  ('p1', 'https://www.diamondairsale.com/upload/product/HQ6N3LgCU20240529174036.png', 1),
  ('p2', 'https://www.electrolux.co.th/globalassets/appliances/air-conditioners/esv09crr-a1/esv09crr-b5_fr_jan21.png', 0),
  ('p2', 'https://i02.appmifile.com/561_operator_sg/13/02/2026/bac5f95ea8dafe014e86367828ec4301.png', 1),
  ('p3', 'https://www.electrolux.co.th/globalassets/appliances/air-fryer/e5af1-600p/fr-e5af1-600p-en-jul23-1500x1500.png', 0),
  ('p3', 'https://www.electrolux.co.th/globalassets/appliances/air-fryer/e3af1-200b/fr-e3af1-200b-1500x1500.1-1.png?width=1200&height=630', 1),
  ('p4', 'https://www.electrolux.co.th/globalassets/appliances/refrigerator/eqe4900a-b/eqe4900a-b-fr-cl-nov22-1500x1500.png', 0),
  ('p5', 'https://images.philips.com/is/image/philipsconsumer/29b25a5f38fe4026aeb2b143006ab81c?wid=700&hei=700&$pnglarge$', 0),
  ('p5', 'https://images.samsung.com/is/image/samsung/p6pim/th/ua55ue100fkxxt/gallery/th-uhd-u8000f-551805-ua55ue100fkxxt-547279037?$624_468_PNG$', 1),
  ('p6', 'https://images.samsung.com/is/image/samsung/p6pim/th/wa12cg5441byst/gallery/th-wa5000c-458372-wa12cg5441byst-536381338?$624_468_PNG$', 0),
  ('p6', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFvjQDu5eDIDgYs3_3s-JyAK3zGCTvglDdnMQRiXHZPQ&s=10', 1),
  ('p7', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAzPddnFJxymIbxFI2UkJqbMnqGF8YrdycEH14Pz55Eg&s=10', 0),
  ('p7', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1uGesCIW8cXbWR83I0rd0dvhGBpydRPK7WI-0i6AwMw&s=10', 1),
  ('p8', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTim0QdGfwo_5bxW_HAGO6YP8WeWMhpPFEsYZ3cqj9y4Q&s=10', 0),
  ('p8', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiPa2-HRr89Wt-1XB70dma2pMacfntH94PCFPbgxc-Xg&s=10', 1),
  ('p9', 'https://www.electrolux.co.th/globalassets/appliances/microwave-ovens/emg25d22nb/emg25d22nb-th-fr-cl-logo-1500x1500.png', 0),
  ('p9', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiroeOLwLT9jqwbDfWDNaW_A9np5cFrZJSMTL53at0ww&s=10', 1),
  ('p10', 'https://www.electrolux.co.th/globalassets/catalog/refrigerators/eum0930ad-fr-cl-1500x1500-new.png', 0),
  ('p10', 'https://img.th.my-best.com/product_images/1be62754985d80fc2bb05e2264d0ba95.png?ixlib=rails-4.3.1&q=70&lossless=0&w=800&h=800&fit=clip&s=778a1377f28743ae66faa1495658256f', 1),
  ('p11', 'https://images.philips.com/is/image/philipsconsumer/5e579e979620429689ffaffe00b101d7?wid=700&hei=700&$pnglarge$', 0),
  ('p11', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVjSboL11GW0z_GlIcRIrhN3a4zxHhyYOgyof2yyJlxQ&s=10', 1),
  ('p12', 'https://static-marketing-2.onestockhome.com/items/47691083/images/36758_l.png', 0),
  ('p12', 'https://static-marketing-2.onestockhome.com/items/47691083/images/36759_original.png', 1);

-- ---------- สต๊อกตามสาขา ----------
INSERT INTO product_branch_stock (product_id, branch_code, branch_name, in_stock) VALUES
  ('p1', 'b1', 'สาขาสุขุมวิท', 1),
  ('p1', 'b2', 'สาขาลาดพร้าว', 1),
  ('p1', 'b3', 'สาขาบางนา', 0),
  ('p1', 'b4', 'สาขานนทบุรี', 1),
  ('p2', 'b1', 'สาขาสุขุมวิท', 1),
  ('p2', 'b2', 'สาขาลาดพร้าว', 0),
  ('p2', 'b3', 'สาขาบางนา', 0),
  ('p2', 'b4', 'สาขานนทบุรี', 1),
  ('p3', 'b1', 'สาขาสุขุมวิท', 1),
  ('p3', 'b2', 'สาขาลาดพร้าว', 1),
  ('p3', 'b3', 'สาขาบางนา', 0),
  ('p3', 'b4', 'สาขานนทบุรี', 1),
  ('p4', 'b1', 'สาขาสุขุมวิท', 1),
  ('p4', 'b2', 'สาขาลาดพร้าว', 1),
  ('p4', 'b3', 'สาขาบางนา', 0),
  ('p4', 'b4', 'สาขานนทบุรี', 1),
  ('p5', 'b1', 'สาขาสุขุมวิท', 1),
  ('p5', 'b2', 'สาขาลาดพร้าว', 1),
  ('p5', 'b3', 'สาขาบางนา', 1),
  ('p5', 'b4', 'สาขานนทบุรี', 1),
  ('p6', 'b1', 'สาขาสุขุมวิท', 0),
  ('p6', 'b2', 'สาขาลาดพร้าว', 0),
  ('p6', 'b3', 'สาขาบางนา', 0),
  ('p6', 'b4', 'สาขานนทบุรี', 0),
  ('p7', 'b1', 'สาขาสุขุมวิท', 1),
  ('p7', 'b2', 'สาขาลาดพร้าว', 1),
  ('p7', 'b3', 'สาขาบางนา', 0),
  ('p7', 'b4', 'สาขานนทบุรี', 1),
  ('p8', 'b1', 'สาขาสุขุมวิท', 1),
  ('p8', 'b2', 'สาขาลาดพร้าว', 0),
  ('p8', 'b3', 'สาขาบางนา', 1),
  ('p8', 'b4', 'สาขานนทบุรี', 1),
  ('p9', 'b1', 'สาขาสุขุมวิท', 1),
  ('p9', 'b2', 'สาขาลาดพร้าว', 1),
  ('p9', 'b3', 'สาขาบางนา', 0),
  ('p9', 'b4', 'สาขานนทบุรี', 1),
  ('p10', 'b1', 'สาขาสุขุมวิท', 1),
  ('p10', 'b2', 'สาขาลาดพร้าว', 1),
  ('p10', 'b3', 'สาขาบางนา', 0),
  ('p10', 'b4', 'สาขานนทบุรี', 1),
  ('p11', 'b1', 'สาขาสุขุมวิท', 1),
  ('p11', 'b2', 'สาขาลาดพร้าว', 1),
  ('p11', 'b3', 'สาขาบางนา', 0),
  ('p11', 'b4', 'สาขานนทบุรี', 1),
  ('p12', 'b1', 'สาขาสุขุมวิท', 1),
  ('p12', 'b2', 'สาขาลาดพร้าว', 1),
  ('p12', 'b3', 'สาขาบางนา', 0),
  ('p12', 'b4', 'สาขานนทบุรี', 1);

-- ---------- คูปองตัวอย่าง ----------
DELETE FROM coupons;
INSERT INTO coupons (code, title, discount_type, discount_value, min_spend, expires_at) VALUES
  ('WELCOME100', 'ส่วนลด 100 บาท สำหรับลูกค้าใหม่', 'amount', 100, 1000, '2026-12-31'),
  ('SAVE10', 'ลด 10% สูงสุด 500 บาท', 'percent', 10, 2000, '2026-12-31'),
  ('FREESHIP', 'ส่งฟรีสำหรับสินค้าชิ้นใหญ่', 'amount', 150, 500, '2026-12-31');

-- ============================================================
--  ตรวจผล
--  SELECT COUNT(*) FROM products;              -- ต้องได้ 12
--  SELECT COUNT(*) FROM categories;            -- ต้องได้ 7
--  SELECT COUNT(*) FROM product_images;        -- ต้องได้ 23
--  SELECT COUNT(*) FROM product_branch_stock;  -- ต้องได้ 48
--  SELECT id, name, brand FROM products LIMIT 5;  -- ภาษาไทยต้องไม่เป็น ???
-- ============================================================
