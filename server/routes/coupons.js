const express = require('express');

const pool = require('../db');
const auth = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();
router.use(auth);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query(
      `SELECT * FROM coupons
       WHERE is_active = 1 AND (expires_at IS NULL OR expires_at >= CURDATE())
       ORDER BY id DESC`
    );
    res.json(
      rows.map((r) => ({
        id: r.id,
        code: r.code,
        title: r.title,
        discountType: r.discount_type,
        discountValue: Number(r.discount_value),
        minSpend: Number(r.min_spend),
        expiresAt: r.expires_at,
      }))
    );
  })
);

module.exports = router;
