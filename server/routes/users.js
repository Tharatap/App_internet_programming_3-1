const express = require('express');

const pool = require('../db');
const auth = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();
router.use(auth);

// PATCH /api/users/me/settings  { language?, theme?, notifyPromo? }
router.patch(
  '/me/settings',
  asyncHandler(async (req, res) => {
    const { language, theme, notifyPromo } = req.body;
    const fields = [];
    const params = [];

    if (language !== undefined) {
      fields.push('language = ?');
      params.push(language);
    }
    if (theme !== undefined) {
      fields.push('theme = ?');
      params.push(theme);
    }
    if (notifyPromo !== undefined) {
      fields.push('notify_promo = ?');
      params.push(notifyPromo ? 1 : 0);
    }
    if (fields.length === 0) return res.json({ ok: true });

    params.push(req.userId);
    await pool.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
    res.json({ ok: true });
  })
);

module.exports = router;
