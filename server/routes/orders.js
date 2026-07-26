const express = require('express');

const pool = require('../db');
const auth = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');

const router = express.Router();
router.use(auth);

function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 900000 + 100000);
  return `CE${y}${m}${d}${rand}`;
}

function toOrderJson(order, items) {
  return {
    id: order.id,
    orderNumber: order.order_number,
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shipping_fee),
    discount: Number(order.discount),
    total: Number(order.total),
    status: order.status,
    shipRecipient: order.ship_recipient,
    shipPhone: order.ship_phone,
    shipAddress: order.ship_address,
    createdAt: order.created_at,
    items: items.map((it) => ({
      productId: it.product_id,
      name: it.name,
      price: Number(it.price),
      quantity: it.quantity,
      imageUrl: it.image_url,
    })),
  };
}

// POST /api/orders  { addressId }
// สร้าง order จากสินค้าที่ selected=1 ในตะกร้า — คำนวณราคาใหม่ฝั่ง server เสมอ (ห้ามเชื่อ client)
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { addressId } = req.body;
    if (!addressId) return res.status(400).json({ message: 'กรุณาเลือกที่อยู่จัดส่ง' });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [addressRows] = await conn.execute(
        'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
        [addressId, req.userId]
      );
      if (addressRows.length === 0) {
        await conn.rollback();
        return res.status(400).json({ message: 'ไม่พบที่อยู่จัดส่งที่เลือก' });
      }
      const address = addressRows[0];

      // ดึงราคาปัจจุบันจาก products เสมอ ไม่เชื่อราคาจาก client
      const [cartRows] = await conn.execute(
        `SELECT c.product_id, c.quantity, p.name, p.price, p.in_stock
         FROM cart_items c
         JOIN products p ON p.id = c.product_id
         WHERE c.user_id = ? AND c.selected = 1
         FOR UPDATE`,
        [req.userId]
      );
      if (cartRows.length === 0) {
        await conn.rollback();
        return res.status(400).json({ message: 'ไม่มีสินค้าที่เลือกไว้สำหรับสั่งซื้อ' });
      }
      const outOfStock = cartRows.find((r) => !r.in_stock);
      if (outOfStock) {
        await conn.rollback();
        return res.status(400).json({ message: `สินค้า "${outOfStock.name}" หมดสต๊อกแล้ว` });
      }

      const productIds = cartRows.map((r) => r.product_id);
      const placeholders = productIds.map(() => '?').join(',');
      const [imageRows] = await conn.query(
        `SELECT product_id, url FROM product_images
         WHERE product_id IN (${placeholders}) ORDER BY sort_order ASC`,
        productIds
      );
      const firstImage = {};
      imageRows.forEach((img) => {
        if (!(img.product_id in firstImage)) firstImage[img.product_id] = img.url;
      });

      const subtotal = cartRows.reduce((sum, r) => sum + Number(r.price) * r.quantity, 0);
      const shippingFee = subtotal >= 500 ? 0 : 50; // ตัวอย่างกฎค่าส่ง ปรับได้ตามโปรฯ จริง
      const discount = 0;
      const total = subtotal + shippingFee - discount;

      const orderNumber = generateOrderNumber();
      const shipAddress = `${address.line1} ${address.district} ${address.province} ${address.postcode}`.trim();

      const [orderResult] = await conn.execute(
        `INSERT INTO orders
           (user_id, order_number, subtotal, shipping_fee, discount, total,
            status, ship_recipient, ship_phone, ship_address)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
        [
          req.userId,
          orderNumber,
          subtotal,
          shippingFee,
          discount,
          total,
          address.recipient,
          address.phone,
          shipAddress,
        ]
      );
      const orderId = orderResult.insertId;

      for (const item of cartRows) {
        await conn.execute(
          `INSERT INTO order_items (order_id, product_id, name, price, quantity, image_url)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, item.product_id, item.name, item.price, item.quantity, firstImage[item.product_id] ?? null]
        );
      }

      // เคลียร์เฉพาะรายการที่สั่งซื้อไปแล้ว
      await conn.execute('DELETE FROM cart_items WHERE user_id = ? AND selected = 1', [
        req.userId,
      ]);

      await conn.execute(
        `INSERT INTO notifications (user_id, title, body, type)
         VALUES (?, ?, ?, 'order')`,
        [req.userId, 'สั่งซื้อสำเร็จ', `คำสั่งซื้อ ${orderNumber} ของคุณสำเร็จแล้ว`]
      );

      await conn.commit();

      const [orderRows] = await pool.execute('SELECT * FROM orders WHERE id = ?', [orderId]);
      const [itemRows] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [
        orderId,
      ]);
      res.status(201).json(toOrderJson(orderRows[0], itemRows));
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  })
);

// GET /api/orders — ประวัติคำสั่งซื้อ
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );
    if (orders.length === 0) return res.json([]);

    const orderIds = orders.map((o) => o.id);
    const placeholders = orderIds.map(() => '?').join(',');
    const [items] = await pool.query(
      `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
      orderIds
    );
    const itemsByOrder = {};
    items.forEach((it) => {
      (itemsByOrder[it.order_id] ??= []).push(it);
    });

    res.json(orders.map((o) => toOrderJson(o, itemsByOrder[o.id] ?? [])));
  })
);

// GET /api/orders/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const [orders] = await pool.execute('SELECT * FROM orders WHERE id = ? AND user_id = ?', [
      req.params.id,
      req.userId,
    ]);
    if (orders.length === 0) return res.status(404).json({ message: 'ไม่พบคำสั่งซื้อ' });

    const [items] = await pool.execute('SELECT * FROM order_items WHERE order_id = ?', [
      req.params.id,
    ]);
    res.json(toOrderJson(orders[0], items));
  })
);

module.exports = router;
