const express = require('express');

const pool = require('../db');
const auth = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();
router.use(auth);

function toJson(row) {
  return {
    id: row.id,
    label: row.label,
    recipient: row.recipient,
    phone: row.phone,
    line1: row.line1,
    district: row.district,
    province: row.province,
    postcode: row.postcode,
    isDefault: !!row.is_default,
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC',
      [req.userId]
    );
    res.json(rows.map(toJson));
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { label, recipient, phone, line1, district, province, postcode, isDefault } = req.body;
    if (!recipient || !phone || !line1) {
      return res.status(400).json({ message: 'กรุณากรอกชื่อผู้รับ เบอร์โทร และที่อยู่ให้ครบ' });
    }

    if (isDefault) {
      await pool.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.userId]);
    }

    const [result] = await pool.execute(
      `INSERT INTO addresses (user_id, label, recipient, phone, line1, district, province, postcode, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.userId,
        label || 'บ้าน',
        recipient,
        phone,
        line1,
        district || '',
        province || '',
        postcode || '',
        isDefault ? 1 : 0,
      ]
    );
    const [rows] = await pool.execute('SELECT * FROM addresses WHERE id = ?', [result.insertId]);
    res.status(201).json(toJson(rows[0]));
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const [owned] = await pool.execute('SELECT id FROM addresses WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.userId,
    ]);
    if (owned.length === 0) return res.status(404).json({ message: 'ไม่พบที่อยู่' });

    const { label, recipient, phone, line1, district, province, postcode, isDefault } = req.body;
    if (isDefault) {
      await pool.execute('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.userId]);
    }

    await pool.execute(
      `UPDATE addresses SET
         label = COALESCE(?, label), recipient = COALESCE(?, recipient),
         phone = COALESCE(?, phone), line1 = COALESCE(?, line1),
         district = COALESCE(?, district), province = COALESCE(?, province),
         postcode = COALESCE(?, postcode), is_default = ?
       WHERE id = ? AND user_id = ?`,
      [
        label,
        recipient,
        phone,
        line1,
        district,
        province,
        postcode,
        isDefault ? 1 : 0,
        req.params.id,
        req.userId,
      ]
    );
    const [rows] = await pool.execute('SELECT * FROM addresses WHERE id = ?', [req.params.id]);
    res.json(toJson(rows[0]));
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await pool.execute('DELETE FROM addresses WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.userId,
    ]);
    res.json({ ok: true });
  })
);

module.exports = router;
