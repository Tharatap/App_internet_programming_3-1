const { fetchAllStores } = require('./store-fetcher');
const { analyzeMarket } = require('./market-clusters');

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

/**
 * cache ผลดึงสินค้าจากทุกร้านไว้ 5 นาที
 *
 * เหตุผลต่างจาก cluster-cache.js ที่ทำเพื่อความเร็ว — อันนี้ทำเพื่อ **มารยาทต่อเซิร์ฟเวอร์เพื่อน**
 * ทุกครั้งที่เปิดหน้าจอคือยิง 5 request ข้ามเครื่อง ถ้าไม่ cache แล้วมีคนกดรีเฟรชรัว ๆ
 * เท่ากับยิงถล่มเครื่องเพื่อนที่รัน node ค้าง terminal อยู่
 *
 * เก็บ "ข้อมูลดิบที่ดึงมา" ไม่ใช่ "ผลวิเคราะห์" เพราะการสลับ mode/k ควรใช้ข้อมูลชุดเดิม
 * คำนวณใหม่ในเครื่อง ไม่ต้องไปกวนเพื่อนซ้ำ
 */
async function getStoreProducts() {
  const now = Date.now();
  const cached = cache.get('stores');
  if (cached && cached.expiresAt > now) return cached.value;

  const value = await fetchAllStores();
  cache.set('stores', { value, expiresAt: now + CACHE_TTL_MS });
  return value;
}

async function getMarketAnalysis(mode, k) {
  const { products, sources } = await getStoreProducts();
  return analyzeMarket(products, sources, mode, k);
}

module.exports = { getMarketAnalysis };
