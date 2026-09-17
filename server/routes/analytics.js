const express = require('express');

const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const { asyncHandler } = require('../middleware/error');
const { getClustering } = require('../ml/cluster-cache');
const { getMarketAnalysis } = require('../ml/market-cache');

const router = express.Router();

router.get(
  '/product-clusters',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const rawK = req.query.k;
    let k;
    if (rawK !== undefined && rawK !== 'auto') {
      k = Number(rawK);
      if (!Number.isInteger(k) || k < 2 || k > 6) {
        return res.status(400).json({
          message: 'จำนวนกลุ่มต้องเป็น auto หรือตัวเลข 2 ถึง 6',
        });
      }
    }

    try {
      res.json(await getClustering(k));
    } catch (error) {
      if (error && typeof error === 'object' && error.status) throw error;
      const analysisError = new Error('วิเคราะห์ข้อมูลสินค้าไม่สำเร็จ');
      analysisError.cause = error;
      throw analysisError;
    }
  })
);

// GET /api/analytics/market-clusters?mode=relative|absolute&k=3
// จัดกลุ่มสินค้าข้ามร้านในกลุ่มด้วย "ราคา" อย่างเดียว (ดูรายชื่อร้านที่ config/stores.js)
router.get(
  '/market-clusters',
  auth,
  adminOnly,
  asyncHandler(async (req, res) => {
    const rawMode = req.query.mode ?? 'relative';
    if (rawMode !== 'relative' && rawMode !== 'absolute') {
      return res.status(400).json({ message: 'mode ต้องเป็น relative หรือ absolute' });
    }

    const rawK = req.query.k;
    let k = 3;
    if (rawK !== undefined) {
      k = Number(rawK);
      if (!Number.isInteger(k) || k < 2 || k > 6) {
        return res.status(400).json({ message: 'จำนวนกลุ่มต้องเป็นตัวเลข 2 ถึง 6' });
      }
    }

    try {
      res.json(await getMarketAnalysis(rawMode, k));
    } catch (error) {
      if (error && typeof error === 'object' && error.status) throw error;
      const wrapped = new Error('ดึงข้อมูลสินค้าข้ามร้านไม่สำเร็จ');
      wrapped.cause = error;
      throw wrapped;
    }
  })
);

module.exports = router;
