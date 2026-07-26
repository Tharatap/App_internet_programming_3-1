-- ============================================================
--  Chaje Electric — โครงสร้างฐานข้อมูล (MySQL 8.0)
--  Database: ip_std6730202645
--
--  วิธีใช้: phpMyAdmin → เลือก DB ip_std6730202645 → แท็บ SQL (หรือ Import)
--          → วางไฟล์นี้ทั้งหมด → กด Go
--  หมายเหตุ: รันซ้ำได้ (ใช้ CREATE TABLE IF NOT EXISTS)
--
--  ⚠️ ไม่มี FOREIGN KEY: user ของฐานข้อมูลนี้ไม่มีสิทธิ์ REFERENCES
--     (เจอ error #1142 ตอนทดสอบจริง) จึงคุมความสัมพันธ์ของข้อมูล
--     (เช่น ลบ user แล้วต้องลบ cart/favorites/orders ของ user นั้นด้วย)
--     ที่ฝั่งโค้ด Express แทน — ดู server/routes/*.js
--     Index สำหรับ join/filter ยังคงไว้ครบเพื่อความเร็ว query
-- ============================================================

SET NAMES utf8mb4;

-- ------------------------------------------------------------
-- ผู้ใช้งาน
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email          VARCHAR(190) NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,          -- bcrypt จาก password_hash() ห้ามเก็บรหัสดิบ
  name           VARCHAR(120) NOT NULL,
  avatar_url     TEXT NULL,
  language       ENUM('th','en')                 NOT NULL DEFAULT 'th',
  theme          ENUM('light','dark','system')   NOT NULL DEFAULT 'light',
  notify_promo   TINYINT(1) NOT NULL DEFAULT 1,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- หมวดหมู่สินค้า  (id ตรงกับ Category.id ในแอป เช่น 'air','tv')
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id    VARCHAR(32) PRIMARY KEY,
  name  VARCHAR(120) NOT NULL,
  icon  VARCHAR(40)  NOT NULL          -- ตรงกับ CategoryIconName ใน src/types/product.ts
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- สินค้า  (id ตรงกับของเดิมในแอป: p1..p12)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id                     VARCHAR(32) PRIMARY KEY,
  name                   VARCHAR(190)   NOT NULL,
  category_id            VARCHAR(32)    NOT NULL,  -- อ้างอิง categories.id (คุมที่โค้ด ไม่ใช้ FK)
  brand                  VARCHAR(80)    NOT NULL DEFAULT '',   -- ใช้ทำตัวกรอง "ยี่ห้อ"
  price                  DECIMAL(10,2)  NOT NULL,              -- เงินต้องใช้ DECIMAL ไม่ใช่ FLOAT
  original_price         DECIMAL(10,2)  NULL,
  description            TEXT           NOT NULL,
  rating                 DECIMAL(2,1)   NOT NULL DEFAULT 0.0,
  review_count           INT UNSIGNED   NOT NULL DEFAULT 0,
  energy_saving_percent  TINYINT UNSIGNED NULL,
  in_stock               TINYINT(1)     NOT NULL DEFAULT 1,
  is_flash_sale          TINYINT(1)     NOT NULL DEFAULT 0,
  installment_per_month  DECIMAL(10,2)  NULL,
  spec_power             VARCHAR(120)   NOT NULL DEFAULT '',
  spec_suitable_room     VARCHAR(120)   NOT NULL DEFAULT '',
  spec_warranty          VARCHAR(120)   NOT NULL DEFAULT '',
  created_at             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_products_category (category_id),
  KEY idx_products_price    (price),
  KEY idx_products_brand    (brand),
  KEY idx_products_name     (name),
  KEY idx_products_flash    (is_flash_sale)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- หมายเหตุเรื่องการค้นหา:
-- ไม่ใช้ FULLTEXT เพราะภาษาไทยไม่มีช่องว่างระหว่างคำ MySQL จึงตัดคำไม่ถูก
-- ให้ค้นด้วย  WHERE name LIKE CONCAT('%', ?, '%') OR description LIKE CONCAT('%', ?, '%')

-- ------------------------------------------------------------
-- รูปสินค้า (1 สินค้ามีได้หลายรูป — MySQL เก็บ array ไม่ได้จึงต้องแยกตาราง)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  VARCHAR(32) NOT NULL,  -- อ้างอิง products.id
  url         TEXT        NOT NULL,
  sort_order  TINYINT UNSIGNED NOT NULL DEFAULT 0,
  KEY idx_pimg_product (product_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- สต๊อกตามสาขา
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_branch_stock (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id   VARCHAR(32)  NOT NULL,  -- อ้างอิง products.id
  branch_code  VARCHAR(16)  NOT NULL,       -- b1..b4
  branch_name  VARCHAR(120) NOT NULL,
  in_stock     TINYINT(1)   NOT NULL DEFAULT 1,
  KEY idx_pbs_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- ที่อยู่จัดส่ง
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,  -- อ้างอิง users.id
  label       VARCHAR(60)  NOT NULL DEFAULT 'บ้าน',
  recipient   VARCHAR(120) NOT NULL,
  phone       VARCHAR(20)  NOT NULL,
  line1       VARCHAR(255) NOT NULL,
  district    VARCHAR(120) NOT NULL DEFAULT '',
  province    VARCHAR(120) NOT NULL DEFAULT '',
  postcode    VARCHAR(10)  NOT NULL DEFAULT '',
  is_default  TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_addr_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- ตะกร้าสินค้า
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,  -- อ้างอิง users.id
  product_id  VARCHAR(32)  NOT NULL,  -- อ้างอิง products.id
  quantity    SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  selected    TINYINT(1)   NOT NULL DEFAULT 1,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cart_user_product (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- รายการโปรด
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS favorites (
  user_id     INT UNSIGNED NOT NULL,  -- อ้างอิง users.id
  product_id  VARCHAR(32)  NOT NULL,  -- อ้างอิง products.id
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- คำสั่งซื้อ  (เก็บ snapshot ที่อยู่ ณ ตอนสั่ง)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,  -- อ้างอิง users.id
  order_number   VARCHAR(32)  NOT NULL,
  subtotal       DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_fee   DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount       DECIMAL(10,2) NOT NULL DEFAULT 0,
  total          DECIMAL(10,2) NOT NULL DEFAULT 0,
  status         ENUM('pending','confirmed','shipping','delivered','cancelled')
                 NOT NULL DEFAULT 'pending',
  ship_recipient VARCHAR(120) NOT NULL,
  ship_phone     VARCHAR(20)  NOT NULL,
  ship_address   VARCHAR(500) NOT NULL,     -- snapshot ข้อความที่อยู่เต็ม
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_orders_number (order_number),
  KEY idx_orders_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- รายการสินค้าในคำสั่งซื้อ  (snapshot ชื่อ/ราคา/รูป ณ ตอนสั่ง)
-- ราคาสินค้าเปลี่ยนทีหลังต้องไม่กระทบ order เก่า จึงไม่อ้างอิงราคาปัจจุบันจาก products
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id    INT UNSIGNED NOT NULL,  -- อ้างอิง orders.id
  product_id  VARCHAR(32)  NOT NULL,
  name        VARCHAR(190) NOT NULL,
  price       DECIMAL(10,2) NOT NULL,
  quantity    SMALLINT UNSIGNED NOT NULL,
  image_url   TEXT NULL,
  KEY idx_oitem_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- การแจ้งเตือน
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,  -- อ้างอิง users.id
  title       VARCHAR(190) NOT NULL,
  body        VARCHAR(500) NOT NULL DEFAULT '',
  type        VARCHAR(40)  NOT NULL DEFAULT 'general',   -- order | promo | general
  is_read     TINYINT(1)   NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_notif_user (user_id, is_read, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- คูปองส่วนลด (ตัวเลือกเสริม — ใช้กับหน้า "คูปองส่วนลด")
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code           VARCHAR(40)  NOT NULL,
  title          VARCHAR(190) NOT NULL,
  discount_type  ENUM('percent','amount') NOT NULL DEFAULT 'amount',
  discount_value DECIMAL(10,2) NOT NULL,
  min_spend      DECIMAL(10,2) NOT NULL DEFAULT 0,
  expires_at     DATE NULL,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_coupon_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  ตรวจผล: ต้องเห็น 11 ตาราง
--  SHOW TABLES;
-- ============================================================
