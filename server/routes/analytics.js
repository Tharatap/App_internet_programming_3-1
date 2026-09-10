const express = require('express');

const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');
const { asyncHandler } = require('../middleware/error');
const { getClustering } = require('../ml/cluster-cache');

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

module.exports = router;
