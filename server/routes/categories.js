const express = require('express');

const pool = require('../db');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.query('SELECT id, name, icon FROM categories ORDER BY name ASC');
    res.json(rows);
  })
);

module.exports = router;
