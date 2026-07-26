const express = require('express');

const pool = require('../db');
const auth = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();
router.use(auth);

// GET /api/favorites — คืน product id ทั้งหมดที่ user คนนี้กดหัวใจไว้
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute('SELECT product_id FROM favorites WHERE user_id = ?', [
      req.userId,
    ]);
    res.json(rows.map((r) => r.product_id));
  })
);

// POST /api/favorites/:productId — toggle
router.post(
  '/:productId',
  asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const [existing] = await pool.execute(
      'SELECT 1 FROM favorites WHERE user_id = ? AND product_id = ?',
      [req.userId, productId]
    );

    if (existing.length > 0) {
      await pool.execute('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [
        req.userId,
        productId,
      ]);
      return res.json({ favorited: false });
    }

    await pool.execute('INSERT INTO favorites (user_id, product_id) VALUES (?, ?)', [
      req.userId,
      productId,
    ]);
    res.json({ favorited: true });
  })
);

module.exports = router;
