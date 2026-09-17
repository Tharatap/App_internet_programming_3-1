const http = require('http');

const { STORES } = require('../config/stores');

const REQUEST_TIMEOUT_MS = 5000;

/**
 * ยิง GET แล้ว parse JSON — ใช้โมดูล http ของ Node ไม่ใช่ fetch
 *
 * ตั้งใจไม่ใช้ fetch เพราะ fetch เป็น global ตั้งแต่ Node 18 เท่านั้น และเรายังไม่รู้ว่า
 * เซิร์ฟเวอร์ที่ deploy จริงเป็นเวอร์ชันอะไร — ถ้าเป็น Node 16 โค้ดจะพังทันทีตอนรัน
 * ส่วน http มีมาทุกเวอร์ชัน แลกกับโค้ดยาวขึ้นนิดหน่อยแต่ไม่มีความเสี่ยง
 */
function getJson(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, { timeout: REQUEST_TIMEOUT_MS }, (response) => {
      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error('ข้อมูลที่ได้ไม่ใช่ JSON'));
        }
      });
    });

    // ต้อง destroy เองด้วย — timeout ของ http แค่ยิง event ไม่ได้ตัดการเชื่อมต่อให้
    request.on('timeout', () => {
      request.destroy(new Error(`ไม่ตอบสนองภายใน ${REQUEST_TIMEOUT_MS / 1000} วินาที`));
    });
    request.on('error', (error) => reject(error));
  });
}

/** เพื่อนแต่ละคนห่อข้อมูลไม่เหมือนกัน — บางคน { items: [...] } บางคนคืน array ตรง ๆ */
function extractRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.items)) return payload.items;
  throw new Error('ไม่พบรายการสินค้าใน response');
}

function normalizeStoreRows(store, rows) {
  const products = [];
  rows.forEach((row) => {
    let mapped;
    try {
      mapped = store.map(row);
    } catch {
      return; // แถวเดียวพังไม่ควรทำให้ทั้งร้านพัง
    }
    if (!mapped || mapped.price === null) return;

    products.push({
      // ใส่ชื่อร้านนำหน้า id เพราะแต่ละร้านนับ id ของตัวเองจาก 1 ถ้าไม่ใส่จะทับกันเงียบ ๆ
      key: `${store.id}:${mapped.id}`,
      storeId: store.id,
      storeName: store.name,
      id: mapped.id,
      name: mapped.name || '(ไม่มีชื่อ)',
      price: mapped.price,
      brand: String(mapped.brand ?? '').trim(),
      category: String(mapped.category ?? '').trim(),
    });
  });
  return products;
}

/**
 * ดึงสินค้าจากทุกร้านพร้อมกัน
 *
 * ใช้ allSettled ไม่ใช่ all — เพื่อนรัน `node server.js` ค้าง terminal กันทุกคน
 * เครื่องใครดับก็ดับ ถ้าใช้ all ร้านเดียวล่มจะทำให้ทั้ง endpoint พัง ซึ่งรับไม่ได้
 * ร้านที่ล้มเหลวจะถูกรายงานใน sources ให้หน้าจอบอกผู้ใช้ได้ว่าวิเคราะห์จากกี่ร้าน
 */
async function fetchAllStores() {
  const results = await Promise.allSettled(
    STORES.map(async (store) => normalizeStoreRows(store, extractRows(await getJson(store.url))))
  );

  const products = [];
  const sources = results.map((result, index) => {
    const store = STORES[index];
    const base = { id: store.id, name: store.name, kind: store.kind };

    if (result.status === 'rejected') {
      return { ...base, status: 'failed', productCount: 0, error: result.reason.message };
    }
    products.push(...result.value);
    return { ...base, status: 'ok', productCount: result.value.length };
  });

  return { products, sources };
}

module.exports = { fetchAllStores, REQUEST_TIMEOUT_MS };
