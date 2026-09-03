// ต่อ dataase  lร้าง connectionpool ไปยัง SQL ip_std6730202645
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // connectionLimit แล้วมี query ใหม่เข้ามาอีก ให้ query นั้น รอคิว จนกว่าจะมี connection ว่าง 
  connectionLimit: 10, // จำนวน connection สูงสุด 10 
  charset: 'utf8mb4_unicode_ci', // ขาดไม่ได้ ไม่งั้นภาษาไทยเพี้ยน
});

module.exports = pool;
