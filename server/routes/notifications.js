const express = require('express');

const pool = require('../db');
const auth = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();
router.use(auth);

function toJson(row) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type,
    isRead: !!row.is_read,
    createdAt: row.created_at,
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.userId]
    );
    res.json(rows.map(toJson));
  })
);

router.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    await pool.execute('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.userId,
    ]);
    res.json({ ok: true });
  })
);

module.exports = router;
