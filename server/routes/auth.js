const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = require('../db');
const auth = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();

function toUserJson(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url,
    isAdmin: !!row.is_admin,
    settings: {
      language: row.language,
      theme: row.theme,
      notifyPromo: !!row.notify_promo,
    },
  };
}

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '7d',
  });
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'กรุณากรอกอีเมล รหัสผ่าน และชื่อให้ครบ' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [
      normalizedEmail,
    ]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [normalizedEmail, passwordHash, name]
    );

    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
    res.status(201).json({ token: signToken(result.insertId), user: toUserJson(rows[0]) });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const ok = await bcrypt.compare(password, rows[0].password_hash);
    if (!ok) {
      return res.status(401).json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    res.json({ token: signToken(rows[0].id), user: toUserJson(rows[0]) });
  })
);

router.get(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }
    res.json(toUserJson(rows[0]));
  })
);

module.exports = router;
