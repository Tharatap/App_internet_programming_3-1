const crypto = require('crypto');
const express = require('express');
const fs = require('fs');
const path = require('path');

const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();
const extensions = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

router.post(
  '/',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { mimeType, data } = req.body || {};

    if (!data) {
      return res.status(400).json({ message: 'ไม่พบไฟล์ที่อัปโหลด' });
    }

    const ext = extensions[mimeType];
    if (!ext) {
      return res.status(400).json({ message: 'รองรับเฉพาะไฟล์ JPG, PNG, WEBP' });
    }

    const buffer = Buffer.from(data, 'base64');
    if (buffer.length > 3 * 1024 * 1024) {
      return res.status(400).json({ message: 'ไฟล์ใหญ่เกิน 3MB' });
    }

    const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    await fs.promises.writeFile(path.join(__dirname, '..', 'uploads', name), buffer);

    const url = `${req.protocol}://${req.get('host')}/uploads/${name}`;
    res.json({ url });
  })
);

module.exports = router;
