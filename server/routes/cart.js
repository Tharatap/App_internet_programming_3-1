const express = require('express');

const pool = require('../db');
const auth = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();
router.use(auth); // ทุก endpoint ในไฟล์นี้ต้องล็อกอิน

// GET /api/cart — คืน cart item พร้อมข้อมูลสินค้าแบบย่อ (พอสำหรับหน้าตะกร้า)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
      `SELECT c.product_id, c.quantity, c.selected,
              p.name, p.price, p.original_price, p.in_stock
       FROM cart_items c
       JOIN products p ON p.id = c.product_id
       WHERE c.user_id = ?`,
      [req.userId]
    );

    if (rows.length === 0) return res.json([]);

    const ids = rows.map((r) => r.product_id);
    const placeholders = ids.map(() => '?').join(',');
    const [images] = await pool.query(
      `SELECT product_id, url FROM product_images
       WHERE product_id IN (${placeholders}) ORDER BY sort_order ASC`,
      ids
    );
    const firstImage = {};
    images.forEach((img) => {
      if (!(img.product_id in firstImage)) firstImage[img.product_id] = img.url;
    });

    res.json(
      rows.map((r) => ({
        productId: r.product_id,
        quantity: r.quantity,
        selected: !!r.selected,
        product: {
          id: r.product_id,
          name: r.name,
          price: Number(r.price),
          originalPrice: r.original_price !== null ? Number(r.original_price) : undefined,
          inStock: !!r.in_stock,
          images: firstImage[r.product_id] ? [firstImage[r.product_id]] : [],
        },
      }))
    );
  })
);

// POST /api/cart/items  { productId, quantity }
router.post(
  '/items',
  asyncHandler(async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId is required' });

    await pool.execute(
      `INSERT INTO cart_items (user_id, product_id, quantity, selected)
       VALUES (?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.userId, productId, quantity]
    );
    res.status(201).json({ ok: true });
  })
);

// PATCH /api/cart/items/:productId  { quantity?, selected? }
router.patch(
  '/items/:productId',
  asyncHandler(async (req, res) => {
    const { quantity, selected } = req.body;
    const fields = [];
    const params = [];

    if (quantity !== undefined) {
      if (quantity <= 0) {
        await pool.execute('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [
          req.userId,
          req.params.productId,
        ]);
        return res.json({ ok: true, deleted: true });
      }
      fields.push('quantity = ?');
      params.push(quantity);
    }
    if (selected !== undefined) {
      fields.push('selected = ?');
      params.push(selected ? 1 : 0);
    }
    if (fields.length === 0) return res.json({ ok: true });

    params.push(req.userId, req.params.productId);
    await pool.execute(
      `UPDATE cart_items SET ${fields.join(', ')} WHERE user_id = ? AND product_id = ?`,
      params
    );
    res.json({ ok: true });
  })
);

// DELETE /api/cart/items/:productId
router.delete(
  '/items/:productId',
  asyncHandler(async (req, res) => {
    await pool.execute('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [
      req.userId,
      req.params.productId,
    ]);
    res.json({ ok: true });
  })
);

// PATCH /api/cart/select-all  { selected }
router.patch(
  '/select-all',
  asyncHandler(async (req, res) => {
    const selected = !!req.body.selected;
    await pool.execute('UPDATE cart_items SET selected = ? WHERE user_id = ?', [
      selected ? 1 : 0,
      req.userId,
    ]);
    res.json({ ok: true });
  })
);

module.exports = router;
