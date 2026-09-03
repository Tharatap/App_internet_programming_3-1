require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { errorHandler } = require('./middleware/error');

const app = express();

app.use(cors()); // ขาดไม่ได้ — Expo web เรียกข้ามโดเมน
app.use(express.json({ limit: '6mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

// สร้างโฟลเดอร์ uploads ถ้ายังไม่มี — clone repo มาใหม่จะยังไม่มีโฟลเดอร์นี้
// (git ไม่เก็บโฟลเดอร์เปล่า) ถ้าไม่สร้าง routes/uploads.js จะพังตอนแอดมินอัปโหลดรูป
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/users', require('./routes/users'));
app.use('/api/uploads', require('./routes/uploads'));

app.use((req, res) => res.status(404).json({ message: 'ไม่พบ endpoint นี้' }));
app.use(errorHandler);

const PORT = process.env.PORT;
if (!PORT) {
  console.error('❌ ไม่พบ PORT ใน .env — ใส่ Assigned backend port ที่ระบบแจ้งตอน SSH login');
  process.exit(1);
}

// ต้องใช้ '0.0.0.0' ไม่ใช่ 127.0.0.1 หรือค่าว่าง ไม่งั้นเครื่องภายนอกเรียกไม่ถึง
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Chaje Electric API running on port ${PORT}`);
});
