const express = require('express');

const pool = require('../db');
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

module.exports = router;
