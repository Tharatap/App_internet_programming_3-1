const pool = require('../db');
const { analyzeProductClusters } = require('./cluster-insights');

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

async function getClustering(k) {
  const [rows] = await pool.query(
    `SELECT p.id, p.name, p.category_id, c.name AS category_name, p.brand,
            p.price, p.original_price, p.rating, p.review_count,
            p.energy_saving_percent, p.in_stock, p.is_flash_sale,
            p.installment_per_month, p.created_at
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ORDER BY p.id ASC`
  );

  if (rows.length < 4) {
    return {
      status: 'insufficient_data',
      productCount: rows.length,
      message: 'ต้องมีสินค้าอย่างน้อย 4 รายการ',
    };
  }

  const maxCreatedAt = rows.reduce((latest, row) => {
    const value = row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at ?? '');
    return value > latest ? value : latest;
  }, '');
  const cacheKey = `${k ?? 'auto'}:${rows.length}:${maxCreatedAt}`;
  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > now) return cached.value;

  // ล้างเฉพาะรายการหมดอายุเพื่อไม่ให้ Map โตตามจำนวนการเลือก k ไปเรื่อย ๆ
  for (const [key, entry] of cache.entries()) {
    if (entry.expiresAt <= now) cache.delete(key);
  }

  const value = analyzeProductClusters(rows, k);
  cache.set(cacheKey, { value, expiresAt: now + CACHE_TTL_MS });
  return value;
}

module.exports = { getClustering };
