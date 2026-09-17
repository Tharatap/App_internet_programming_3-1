const { kmeans, silhouetteScore } = require('./kmeans');
const { fetchAllStores } = require('./store-fetcher');

const CLUSTER_COLORS = ['skyBlue', 'mint', 'tan', 'saleBg', 'coin', 'orange'];
const MIN_PRODUCTS = 6;

/**
 * ชื่อชั้นต่างกันตามโหมด เพราะ "กลุ่มล่างสุด" คนละความหมายกัน
 * absolute = ถูกที่สุดในตลาดรวม · relative = ถูกที่สุดเมื่อเทียบกับร้านของตัวเอง
 */
const TIER_LABELS = {
  absolute: {
    2: ['ราคาย่อมเยา', 'ราคาสูง'],
    3: ['ประหยัด', 'ระดับกลาง', 'พรีเมียม'],
    4: ['ประหยัด', 'ระดับกลาง', 'พรีเมียม', 'ลักซ์ชูรี'],
    5: ['เริ่มต้น', 'ประหยัด', 'ระดับกลาง', 'พรีเมียม', 'ลักซ์ชูรี'],
    6: ['เริ่มต้น', 'ประหยัด', 'ระดับกลาง', 'พรีเมียม', 'ลักซ์ชูรี', 'ไฮเอนด์'],
  },
  relative: {
    2: ['สินค้าเรียกลูกค้า', 'สินค้าเรือธง'],
    3: ['สินค้าเรียกลูกค้า', 'สินค้าหลัก', 'สินค้าเรือธง'],
    4: ['สินค้าเรียกลูกค้า', 'สินค้าหลัก', 'สินค้าระดับบน', 'สินค้าเรือธง'],
    5: ['สินค้าเรียกลูกค้า', 'สินค้าราคาเข้าถึงง่าย', 'สินค้าหลัก', 'สินค้าระดับบน', 'สินค้าเรือธง'],
    6: ['สินค้าเรียกลูกค้า', 'สินค้าราคาเข้าถึงง่าย', 'สินค้าหลัก', 'สินค้าระดับบน', 'สินค้าระดับสูง', 'สินค้าเรือธง'],
  },
};

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function average(values) {
  return values.length === 0 ? 0 : values.reduce((sum, v) => sum + v, 0) / values.length;
}

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function standardize(values) {
  const mean = average(values);
  const std = Math.sqrt(average(values.map((v) => (v - mean) ** 2)));
  return values.map((v) => (std === 0 ? 0 : (v - mean) / std));
}

/**
 * โหมด absolute — ราคาจริงของทั้งตลาดรวมกัน ผ่าน log1p ก่อน
 *
 * ต้อง log เพราะราคาข้ามร้านต่างกันหลักพันเท่า (SSD 100 บาท ถึงรถ 9,999,000 บาท)
 * ถ้าใช้ราคาดิบ ระยะทางจะถูกครอบงำด้วยรถทั้งหมดจนของอย่างอื่นกองเป็นจุดเดียว
 */
function absoluteFeature(products) {
  return standardize(products.map((p) => Math.log1p(p.price)));
}

/**
 * โหมด relative — ตำแหน่งราคาของสินค้าเมื่อเทียบกับ "ร้านของตัวเอง" (0 = ถูกสุดของร้าน, 1 = แพงสุด)
 *
 * จุดประสงค์คือทำให้เทียบข้ามร้านได้ทั้งที่สเกลราคาต่างกันมหาศาล — รถ 400,000 บาท
 * คือของถูกของร้านรถ ส่วน SSD 15,900 บาทคือของแพงสุดของร้านนั้น ทั้งที่ตัวเลขสวนทางกัน
 * โหมด absolute จะบอกได้แค่ว่า "รถแพงกว่ารองเท้า" ซึ่งไม่ต้องใช้ ML ก็รู้
 */
function relativeFeature(products) {
  const pricesByStore = new Map();
  products.forEach((p) => {
    if (!pricesByStore.has(p.storeId)) pricesByStore.set(p.storeId, []);
    pricesByStore.get(p.storeId).push(p.price);
  });

  const percentiles = products.map((product) => {
    const prices = pricesByStore.get(product.storeId);
    if (prices.length < 2) return 0.5; // ร้านที่มีสินค้าชิ้นเดียว เทียบกับอะไรไม่ได้ ให้อยู่กลาง
    const less = prices.filter((v) => v < product.price).length;
    const equal = prices.filter((v) => v === product.price).length;
    // ใช้ midrank เพื่อให้สินค้าราคาเท่ากันได้ค่าเดียวกันและอยู่กึ่งกลางของช่วงที่ครอง
    return (less + (equal - 1) / 2) / (prices.length - 1);
  });

  return standardize(percentiles);
}

function summarizeStores(products, assignments, tierById, tierLabels) {
  const byStore = new Map();
  products.forEach((product, index) => {
    if (!byStore.has(product.storeId)) {
      byStore.set(product.storeId, { storeId: product.storeId, storeName: product.storeName, items: [], tiers: [] });
    }
    const entry = byStore.get(product.storeId);
    entry.items.push(product);
    entry.tiers.push(tierById.get(assignments[index]));
  });

  return [...byStore.values()].map((entry) => {
    const prices = entry.items.map((p) => p.price);
    const counts = tierLabels.map((label, tierIndex) => ({
      tierIndex,
      label,
      count: entry.tiers.filter((t) => t === tierIndex).length,
    }));
    const dominant = counts.reduce((best, current) => (current.count > best.count ? current : best));

    return {
      storeId: entry.storeId,
      storeName: entry.storeName,
      productCount: entry.items.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      avgPrice: round(average(prices)),
      medianPrice: round(median(prices)),
      distribution: counts.map((c) => ({ ...c, share: round(c.count / entry.items.length, 3) })),
      dominantTierIndex: dominant.tierIndex,
      dominantTierLabel: dominant.label,
      dominantShare: round(dominant.count / entry.items.length, 3),
    };
  });
}

/**
 * จัดกลุ่มสินค้าข้ามร้านด้วยราคาอย่างเดียว
 * @param {'relative'|'absolute'} mode
 */
function analyzeMarket(products, sources, mode, k) {
  if (products.length < MIN_PRODUCTS) {
    return {
      status: 'insufficient_data',
      mode,
      productCount: products.length,
      sources,
      message: `ต้องมีสินค้ารวมอย่างน้อย ${MIN_PRODUCTS} รายการ (ดึงได้ ${products.length} รายการ)`,
    };
  }

  const feature = mode === 'absolute' ? absoluteFeature(products) : relativeFeature(products);
  const matrix = feature.map((value) => [value]);
  const result = kmeans(matrix, k);
  const silhouette = silhouetteScore(matrix, result.assignments, k);

  const memberIndexes = Array.from({ length: k }, () => []);
  result.assignments.forEach((clusterId, index) => memberIndexes[clusterId].push(index));

  // เรียงชั้นตามราคาเฉลี่ยจริงเสมอ ไม่ว่าโหมดไหน เพื่อให้ tierIndex 0 = ถูกสุดเข้าใจตรงกัน
  // (จัดกลุ่มด้วยมิติเดียว กลุ่มจึงทับกันทางราคาไม่ได้ ชื่อชั้นจึงพูดความจริงเสมอ
  //  ต่างจากโมเดล 5 มิติของ /product-clusters ที่ต้องมีตัวตรวจว่าชั้นทับกันหรือเปล่า)
  const tierOrder = memberIndexes
    .map((indexes, clusterId) => ({ clusterId, avgPrice: average(indexes.map((i) => products[i].price)) }))
    .sort((a, b) => a.avgPrice - b.avgPrice);
  const tierById = new Map(tierOrder.map((entry, tierIndex) => [entry.clusterId, tierIndex]));
  const tierLabels = TIER_LABELS[mode][k];

  const clusters = memberIndexes
    .map((indexes, clusterId) => {
      const members = indexes.map((i) => products[i]);
      const prices = members.map((p) => p.price);
      const tierIndex = tierById.get(clusterId);

      const storeCounts = new Map();
      members.forEach((p) => {
        const current = storeCounts.get(p.storeId) ?? { storeId: p.storeId, storeName: p.storeName, count: 0 };
        current.count += 1;
        storeCounts.set(p.storeId, current);
      });

      return {
        id: clusterId,
        tierIndex,
        label: tierLabels[tierIndex],
        color: CLUSTER_COLORS[tierIndex % CLUSTER_COLORS.length],
        size: members.length,
        priceRange: [Math.min(...prices), Math.max(...prices)],
        avgPrice: round(average(prices)),
        medianPrice: round(median(prices)),
        storeBreakdown: [...storeCounts.values()]
          .map((entry) => ({ ...entry, share: round(entry.count / members.length, 3) }))
          .sort((a, b) => b.count - a.count),
      };
    })
    .sort((a, b) => a.tierIndex - b.tierIndex);

  return {
    status: 'ok',
    generatedAt: new Date().toISOString(),
    mode,
    modeLabel: mode === 'absolute' ? 'ราคาจริงของทั้งตลาด' : 'ตำแหน่งราคาภายในร้านตัวเอง',
    k,
    silhouette: round(silhouette, 4),
    productCount: products.length,
    storeCount: sources.filter((s) => s.status === 'ok').length,
    sources,
    clusters,
    storeProfiles: summarizeStores(products, result.assignments, tierById, tierLabels),
    products: products.map((product, index) => ({
      key: product.key,
      storeId: product.storeId,
      storeName: product.storeName,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      clusterId: result.assignments[index],
      tierIndex: tierById.get(result.assignments[index]),
    })),
  };
}

async function getMarketClusters(mode, k) {
  const { products, sources } = await fetchAllStores();
  return analyzeMarket(products, sources, mode, k);
}

module.exports = { getMarketClusters, analyzeMarket, MIN_PRODUCTS };
