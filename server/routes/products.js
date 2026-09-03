// product
const express = require('express');

const pool = require('../db');
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

/** แปลงแถวจากตาราง products (snake_case) ให้ตรงกับ TypeScript type Product (camelCase) */
function toProductJson(row, images, branchStock) {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    brand: row.brand,
    price: Number(row.price),
    originalPrice: row.original_price !== null ? Number(row.original_price) : undefined,
    images: images.map((img) => img.url),
    description: row.description,
    rating: Number(row.rating),
    reviewCount: row.review_count,
    energySavingPercent: row.energy_saving_percent ?? undefined,
    inStock: !!row.in_stock,
    isFlashSale: !!row.is_flash_sale,
    installmentPerMonth:
      row.installment_per_month !== null ? Number(row.installment_per_month) : undefined,
    specs: {
      power: row.spec_power,
      suitableRoom: row.spec_suitable_room,
      warranty: row.spec_warranty,
    },
    branchStock: branchStock.map((b) => ({
      id: b.branch_code,
      name: b.branch_name,
      inStock: !!b.in_stock,
    })),
  };
}

async function attachRelations(rows) {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const placeholders = ids.map(() => '?').join(',');

  const [images] = await pool.query(
    `SELECT product_id, url, sort_order FROM product_images
     WHERE product_id IN (${placeholders}) ORDER BY sort_order ASC`,
    ids
  );
  const [branches] = await pool.query(
    `SELECT product_id, branch_code, branch_name, in_stock FROM product_branch_stock
     WHERE product_id IN (${placeholders})`,
    ids
  );

  const imagesByProduct = {};
  images.forEach((img) => {
    (imagesByProduct[img.product_id] ??= []).push(img);
  });
  const branchesByProduct = {};
  branches.forEach((b) => {
    (branchesByProduct[b.product_id] ??= []).push(b);
  });

  return rows.map((row) =>
    toProductJson(row, imagesByProduct[row.id] ?? [], branchesByProduct[row.id] ?? [])
  );
}

const SORT_MAP = {
  priceAsc: 'price ASC',
  priceDesc: 'price DESC',
  energy: 'energy_saving_percent DESC',
  name: 'name ASC',
  newest: 'created_at DESC',
};

// GET /api/products?q=&category=&brand=&minPrice=&maxPrice=&energyMin=&inStock=&sort=&page=&limit=
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { q, category, brand, minPrice, maxPrice, energyMin, inStock, sort } = req.query;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;

    const where = [];
    const params = [];

    if (q) {
      // ห้ามใช้ FULLTEXT กับภาษาไทย (ตัดคำไม่ถูก) — ใช้ LIKE แทน
      where.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }
    if (category) {
      where.push('category_id = ?');
      params.push(category);
    }
    if (brand) {
      where.push('brand = ?');
      params.push(brand);
    }
    if (minPrice) {
      where.push('price >= ?');
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      where.push('price <= ?');
      params.push(Number(maxPrice));
    }
    if (energyMin) {
      where.push('energy_saving_percent >= ?');
      params.push(Number(energyMin));
    }
    if (inStock === 'true') {
      where.push('in_stock = 1');
    } else if (inStock === 'false') {
      where.push('in_stock = 0');
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const orderSql = SORT_MAP[sort] ?? 'created_at DESC';

    const [rows] = await pool.query(
      `SELECT * FROM products ${whereSql} ORDER BY ${orderSql} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM products ${whereSql}`,
      params
    );

    res.json({
      items: await attachRelations(rows),
      total: countRows[0].total,
      page,
      limit,
    });
  })
);

// GET /api/products/brands
router.get(
  '/brands',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      "SELECT DISTINCT brand FROM products WHERE brand <> '' ORDER BY brand ASC"
    );
    res.json(rows.map((r) => r.brand));
  })
);

// GET /api/products/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบสินค้า' });
    }
    const [product] = await attachRelations(rows);
    res.json(product);
  })
);

function validateProductInput(body) {
  if (!body.name || !body.categoryId || !body.description) {
    return 'กรุณากรอกชื่อ หมวดหมู่ และคำอธิบายสินค้าให้ครบ';
  }
  if (!(Number(body.price) > 0)) {
    return 'กรุณากรอกราคาสินค้าให้ถูกต้อง';
  }
  return null;
}

async function writeImagesAndBranchStock(conn, productId, images, branchStock) {
  await conn.execute('DELETE FROM product_images WHERE product_id = ?', [productId]);
  for (const [index, url] of (images ?? []).entries()) {
    await conn.execute(
      'INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)',
      [productId, url, index]
    );
  }

  await conn.execute('DELETE FROM product_branch_stock WHERE product_id = ?', [productId]);
  for (const branch of branchStock ?? []) {
    await conn.execute(
      `INSERT INTO product_branch_stock (product_id, branch_code, branch_name, in_stock)
       VALUES (?, ?, ?, ?)`,
      [productId, branch.id, branch.name, branch.inStock ? 1 : 0]
    );
  }
}

// POST /api/products — สร้างสินค้าใหม่ (เฉพาะแอดมิน)
router.post(
  '/',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const body = req.body;
    const validationError = validateProductInput(body);
    if (validationError) return res.status(400).json({ message: validationError });

    const id = `p${Date.now()}`;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      await conn.execute(
        `INSERT INTO products
           (id, name, category_id, brand, price, original_price, description,
            energy_saving_percent, in_stock, is_flash_sale, installment_per_month,
            spec_power, spec_suitable_room, spec_warranty)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          body.name,
          body.categoryId,
          body.brand ?? '',
          body.price,
          body.originalPrice ?? null,
          body.description,
          body.energySavingPercent ?? null,
          body.inStock ? 1 : 0,
          body.isFlashSale ? 1 : 0,
          body.installmentPerMonth ?? null,
          body.specs?.power ?? '',
          body.specs?.suitableRoom ?? '',
          body.specs?.warranty ?? '',
        ]
      );

      await writeImagesAndBranchStock(conn, id, body.images, body.branchStock);

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    const [product] = await attachRelations(rows);
    res.status(201).json(product);
  })
);

// PUT /api/products/:id — แก้ไขสินค้า (เฉพาะแอดมิน)
router.put(
  '/:id',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const body = req.body;
    const validationError = validateProductInput(body);
    if (validationError) return res.status(400).json({ message: validationError });

    const id = req.params.id;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [existing] = await conn.execute('SELECT id FROM products WHERE id = ? FOR UPDATE', [
        id,
      ]);
      if (existing.length === 0) {
        await conn.rollback();
        return res.status(404).json({ message: 'ไม่พบสินค้า' });
      }

      await conn.execute(
        `UPDATE products SET
           name = ?, category_id = ?, brand = ?, price = ?, original_price = ?,
           description = ?, energy_saving_percent = ?, in_stock = ?, is_flash_sale = ?,
           installment_per_month = ?, spec_power = ?, spec_suitable_room = ?, spec_warranty = ?
         WHERE id = ?`,
        [
          body.name,
          body.categoryId,
          body.brand ?? '',
          body.price,
          body.originalPrice ?? null,
          body.description,
          body.energySavingPercent ?? null,
          body.inStock ? 1 : 0,
          body.isFlashSale ? 1 : 0,
          body.installmentPerMonth ?? null,
          body.specs?.power ?? '',
          body.specs?.suitableRoom ?? '',
          body.specs?.warranty ?? '',
          id,
        ]
      );

      await writeImagesAndBranchStock(conn, id, body.images, body.branchStock);

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const [rows] = await pool.execute('SELECT * FROM products WHERE id = ?', [id]);
    const [product] = await attachRelations(rows);
    res.json(product);
  })
);

// DELETE /api/products/:id — ลบสินค้า (เฉพาะแอดมิน)
router.delete(
  '/:id',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [existing] = await conn.execute('SELECT id FROM products WHERE id = ? FOR UPDATE', [
        id,
      ]);
      if (existing.length === 0) {
        await conn.rollback();
        return res.status(404).json({ message: 'ไม่พบสินค้า' });
      }

      // ไม่มี FK ในระบบนี้ — ต้องลบแถวที่อ้างอิงสินค้านี้เองด้วยโค้ด
      // (ไม่แตะ order_items เพราะเป็น snapshot ประวัติการสั่งซื้อ ต้องคงอยู่แม้สินค้าต้นทางถูกลบ)
      await conn.execute('DELETE FROM cart_items WHERE product_id = ?', [id]);
      await conn.execute('DELETE FROM favorites WHERE product_id = ?', [id]);
      await conn.execute('DELETE FROM product_images WHERE product_id = ?', [id]);
      await conn.execute('DELETE FROM product_branch_stock WHERE product_id = ?', [id]);
      await conn.execute('DELETE FROM products WHERE id = ?', [id]);

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    res.status(204).send();
  })
);

module.exports = router;
