const pool = require('../db');
const { asyncHandler } = require('./error');

/** ต้องรันต่อจาก auth middleware (ต้องมี req.userId แล้ว) — เช็ค is_admin สดจาก DB ทุกครั้ง */
const adminOnly = asyncHandler(async (req, res, next) => {
  const [rows] = await pool.execute('SELECT is_admin FROM users WHERE id = ?', [req.userId]);
  if (rows.length === 0 || !rows[0].is_admin) {
    return res.status(403).json({ message: 'เฉพาะแอดมินเท่านั้น' });
  }
  next();
});

module.exports = adminOnly;
