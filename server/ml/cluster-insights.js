const { kmeans, silhouetteScore } = require('./kmeans');
const { buildProductFeatures, restoreFeatureValue } = require('./product-features');

const CLUSTER_COLORS = ['skyBlue', 'mint', 'tan', 'saleBg', 'coin', 'orange'];
const PRICE_TIERS = {
  2: ['คุ้มค่า', 'พรีเมียม'],
  3: ['ประหยัด', 'ระดับกลาง', 'พรีเมียม'],
  4: ['ประหยัด', 'ระดับกลาง', 'พรีเมียม', 'ลักซ์ชูรี'],
  5: ['เริ่มต้น', 'ประหยัด', 'ระดับกลาง', 'พรีเมียม', 'ลักซ์ชูรี'],
  6: ['เริ่มต้น', 'ประหยัด', 'ระดับกลาง', 'พรีเมียม', 'ลักซ์ชูรี', 'ไฮเอนด์'],
};

const FEATURE_TRAITS = {
  price: ['ราคาจับต้องง่าย', 'ราคาสูง'],
  discountPct: ['ส่วนลดน้อย', 'ส่วนลดสูง'],
  rating: ['คะแนนรีวิวต่ำ', 'คะแนนรีวิวสูง'],
  reviewCount: ['รีวิวน้อย', 'รีวิวเยอะ'],
  energySaving: ['ประหยัดไฟน้อย', 'ประหยัดไฟสูง'],
};

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function average(values) {
  return values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function discountPercent(row) {
  const price = Number(row.price);
  const originalPrice = Number(row.original_price);
  return row.original_price !== null && originalPrice > price
    ? ((originalPrice - price) / originalPrice) * 100
    : 0;
}

function topCounts(rows, key, labelKey) {
  const counts = new Map();
  rows.forEach((row) => {
    const id = String(row[key] ?? '');
    const label = String(row[labelKey] ?? '').trim() || 'ไม่ระบุ';
    const current = counts.get(id) ?? { id, name: label, count: 0 };
    current.count += 1;
    counts.set(id, current);
  });
  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'th'))
    .slice(0, 3);
}

/**
 * คะแนนเฉลี่ยต้องนับเฉพาะสินค้าที่มีรีวิวจริง — สินค้าที่ยังไม่มีรีวิวมี rating 0.0 ตาม default
 * ของ schema ถ้านับรวมเข้าไปด้วย กลุ่มที่เป็นสินค้าใหม่ล้วนจะแสดงว่า "คะแนน 0.0" ซึ่งผู้บริหาร
 * จะอ่านว่าลูกค้าให้ 0 ดาว ทั้งที่ความจริงคือยังไม่มีใครรีวิว — คนละเรื่องกันคนละทาง
 * คืน null เมื่อไม่มีสินค้าที่มีรีวิวเลย ให้หน้าจอไปแสดงคำว่า "ยังไม่มีรีวิว" แทนตัวเลข
 */
function averageRating(rows) {
  const rated = rows.filter((row) => Number(row.review_count) > 0);
  return rated.length === 0
    ? null
    : round(average(rated.map((row) => Number(row.rating))), 1);
}

function summarizeCluster(rows) {
  const prices = rows.map((row) => Number(row.price));
  // Number(null) คือ 0 ไม่ใช่ NaN — ต้องคัดค่าว่างทิ้งก่อนแปลง ไม่งั้นสินค้าที่ไม่ได้ระบุ
  // ตัวเลขประหยัดไฟจะถูกนับเป็น 0% แล้วดึงค่าเฉลี่ยของทั้งกลุ่มให้ต่ำกว่าความจริง
  const energyValues = rows
    .filter((row) => row.energy_saving_percent !== null && row.energy_saving_percent !== undefined)
    .map((row) => Number(row.energy_saving_percent))
    .filter(Number.isFinite);
  return {
    avgPrice: round(average(prices)),
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    avgRating: averageRating(rows),
    ratedCount: rows.filter((row) => Number(row.review_count) > 0).length,
    totalReviews: rows.reduce((sum, row) => sum + Number(row.review_count), 0),
    avgDiscountPct: round(average(rows.map(discountPercent)), 1),
    avgEnergySaving: round(average(energyValues), 1),
    outOfStockCount: rows.filter((row) => !row.in_stock).length,
    topCategories: topCounts(rows, 'category_id', 'category_name'),
    topBrands: topCounts(rows, 'brand', 'brand').map(({ name, count }) => ({ name, count })),
  };
}

/** ข้อความคะแนนสำหรับใส่ในเหตุผล — กลุ่มที่ยังไม่มีรีวิวเลยจะไม่มีตัวเลขให้อ้าง */
function ratingText(summary) {
  return summary.avgRating === null ? 'ยังไม่มีรีวิว' : summary.avgRating.toFixed(1);
}

function buildRecommendations(centroidZ, summary, size) {
  const recommendations = [];
  const outOfStockRatio = size === 0 ? 0 : summary.outOfStockCount / size;

  if (summary.ratedCount === 0) {
    recommendations.push({
      title: 'เก็บรีวิวชุดแรกให้ได้ก่อน',
      reason: `ทั้ง ${size} รายการในกลุ่มนี้ยังไม่มีรีวิวเลย ลูกค้าจึงไม่มีข้อมูลประกอบการตัดสินใจ ควรเร่งเก็บรีวิวก่อนทุ่มงบโปรโมชัน`,
      priority: 'high',
      weight: 90,
    });
  }

  if (outOfStockRatio > 0.3) {
    recommendations.push({
      title: 'เติมสต๊อกก่อนโปรโมท',
      reason: `สินค้าหมด ${summary.outOfStockCount} จาก ${size} รายการ ควรเติมของก่อนใช้งบโฆษณา`,
      priority: 'high',
      weight: 100,
    });
  }
  if (centroidZ.rating > 0.5 && centroidZ.reviewCount < -0.5) {
    recommendations.push({
      title: 'แคมเปญเร่งรีวิว',
      reason: `คะแนนเฉลี่ย ${ratingText(summary)} แต่มีรีวิวรวมเพียง ${summary.totalReviews.toLocaleString('th-TH')} ครั้ง ควรให้คูปองหลังรีวิวและดันขึ้นหน้าแรก`,
      priority: 'high',
      weight: 80,
    });
  }
  if (centroidZ.price > 0.5 && centroidZ.discountPct < 0) {
    recommendations.push({
      title: 'ผ่อน 0% นาน 10 เดือน',
      reason: `ราคาเฉลี่ย ${summary.avgPrice.toLocaleString('th-TH')} บาท หรือประมาณ ${round(summary.avgPrice / 10).toLocaleString('th-TH')} บาทต่อเดือน ช่วยลดกำแพงด้านราคาโดยไม่ต้องลดเพิ่ม`,
      priority: 'high',
      weight: 70,
    });
  }
  if (centroidZ.price < -0.3 && centroidZ.reviewCount > 0.5) {
    recommendations.push({
      title: 'จัดเซ็ต / ซื้อคู่ลดเพิ่ม',
      reason: `ราคาเฉลี่ย ${summary.avgPrice.toLocaleString('th-TH')} บาทและมีรีวิวรวม ${summary.totalReviews.toLocaleString('th-TH')} ครั้ง เหมาะกับการเพิ่มมูลค่าต่อคำสั่งซื้อ`,
      priority: 'medium',
      weight: 60,
    });
  }
  if (centroidZ.discountPct > 0.8) {
    recommendations.push({
      title: 'เปลี่ยนเป็น Flash Sale จำกัดเวลา',
      reason: `ส่วนลดเฉลี่ย ${summary.avgDiscountPct.toFixed(1)}% สูงกว่ากลุ่มอื่น ควรจำกัดเวลาแทนส่วนลดถาวรเพื่อรักษามาร์จิ้น`,
      priority: 'high',
      weight: 65,
    });
  }
  if (centroidZ.energySaving > 0.6) {
    recommendations.push({
      title: 'โปรเปลี่ยนเครื่องเก่า + ชูป้ายประหยัดไฟ',
      reason: `กลุ่มนี้ประหยัดไฟเฉลี่ย ${summary.avgEnergySaving.toFixed(1)}% ควรสื่อสารค่าไฟที่ลูกค้าประหยัดได้ต่อปีให้ชัด`,
      priority: 'medium',
      weight: 50,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: 'คงราคาไว้ เฝ้าดูอีก 1 เดือน',
      reason: `ราคาเฉลี่ย ${summary.avgPrice.toLocaleString('th-TH')} บาท คะแนนเฉลี่ย ${ratingText(summary)} ยังไม่มีสัญญาณเด่นพอสำหรับเปลี่ยนโปรโมชัน`,
      priority: 'low',
      weight: 0,
    });
  }

  return recommendations
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map(({ weight, ...recommendation }) => recommendation);
}

function centroidObjects(centroid, stats) {
  const centroidZ = {};
  const restored = {};
  stats.forEach((stat, index) => {
    centroidZ[stat.key] = round(centroid[index], 4);
    restored[stat.key] = round(restoreFeatureValue(centroid[index], stat), 2);
  });
  return { centroidZ, restored };
}

/**
 * ชื่อลักษณะเด่นเรียงตามระยะที่ centroid เบี่ยงจากค่ากลาง
 * คัด price ออกเสมอ — ถ้าใช้ชื่อชั้นราคาอยู่แล้วจะกลายเป็นพูดซ้ำ ("พรีเมียม · ราคาสูง")
 * และถ้าไม่ได้ใช้ชื่อชั้นราคา ก็เพราะราคาแยกกลุ่มไม่ได้จริงอยู่แล้ว
 */
const TRAIT_MIN_Z = 0.5;

function standoutTraits(centroidZ, count) {
  const ranked = Object.entries(centroidZ)
    .filter(([key]) => key !== 'price')
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  // เอ่ยถึงเฉพาะคุณลักษณะที่เบี่ยงจากค่ากลางมากพอ — สินค้าในร้านนี้คะแนนอยู่ในช่วง 4.1-4.8
  // ทั้งหมด การเรียกกลุ่มที่ได้ 4.3 ว่า "คะแนนรีวิวต่ำ" ถูกในเชิงเปรียบเทียบแต่ผู้บริหาร
  // จะอ่านเป็นค่าสัมบูรณ์แล้วเข้าใจผิด ถ้าไม่มีตัวไหนเด่นพอก็หยิบตัวที่เด่นสุดมาตัวเดียว
  return ranked
    .filter(([, z]) => Math.abs(z) >= TRAIT_MIN_Z)
    .slice(0, count)
    .map(([key, z]) => FEATURE_TRAITS[key][z >= 0 ? 1 : 0]);
}

/**
 * ชั้นราคาจะถือว่า "แยกกันจริง" ก็ต่อเมื่อช่วงราคาของทุกชั้นไม่ทับกันเลย
 *
 * เกณฑ์นี้ไม่ได้ตั้งลอย ๆ แต่มาจากสิ่งที่ผู้ใช้เห็นบนการ์ด: ใต้ชื่อกลุ่มคือช่วงราคาของกลุ่มนั้น
 * ถ้าช่วงทับกัน ผู้บริหารจะเห็นคำว่า "พรีเมียม" อยู่เหนือเลข 1,490 ในขณะที่ "ระดับกลาง"
 * แสดง 4,290 ซึ่งขัดกับสายตาทันที และทำให้ไม่เชื่อถือทั้งหน้า
 *
 * ที่เกิดแบบนี้ได้เพราะเราจัดกลุ่มด้วย 5 คุณลักษณะที่น้ำหนักเท่ากัน ราคาจึงมีสิทธิ์ตัดสิน
 * แค่ 1 ใน 5 แต่ชื่อชั้นกลับสัญญาว่าเรียงตามราคาล้วน — เมื่อโมเดลไม่ได้ทำตามที่ชื่อสัญญา
 * ให้เลิกใช้ชื่อนั้นแทนที่จะฝืนใช้ต่อ
 */
function pricesFormCleanTiers(orderedRanges) {
  for (let index = 1; index < orderedRanges.length; index += 1) {
    if (orderedRanges[index].minPrice <= orderedRanges[index - 1].maxPrice) return false;
  }
  return true;
}

function clusterLabel(k, tierIndex, centroidZ, priceSeparated) {
  if (priceSeparated) {
    const [trait] = standoutTraits(centroidZ, 1);
    return trait ? `${PRICE_TIERS[k][tierIndex]} · ${trait}` : PRICE_TIERS[k][tierIndex];
  }
  const traits = standoutTraits(centroidZ, 2);
  // ไม่มีทั้งชั้นราคาและจุดเด่น = กลุ่มที่ค่าทุกด้านเกาะค่ากลาง ซึ่งเป็นข้อมูลที่ใช้ได้จริง
  // (แปลว่ายังไม่ต้องรีบทำโปรโมชันกับกลุ่มนี้) ดีกว่าไปตั้งชื่อจากตัวเลขที่แทบไม่ต่างจากค่าเฉลี่ย
  return traits.length > 0 ? traits.join(' · ') : 'ค่าเฉลี่ยกลาง ๆ ทุกด้าน';
}

function buildKpis(rows, clusterCount) {
  const prices = rows.map((row) => Number(row.price));
  return {
    productCount: rows.length,
    clusterCount,
    avgPrice: round(average(prices)),
    medianPrice: round(median(prices)),
    priceRange: [Math.min(...prices), Math.max(...prices)],
    avgRating: averageRating(rows),
    noReviewCount: rows.filter((row) => Number(row.review_count) === 0).length,
    totalReviews: rows.reduce((sum, row) => sum + Number(row.review_count), 0),
    discountedCount: rows.filter((row) => discountPercent(row) > 0).length,
    outOfStockCount: rows.filter((row) => !row.in_stock).length,
    flashSaleCount: rows.filter((row) => !!row.is_flash_sale).length,
  };
}

function toClusteredProduct(row, clusterId) {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    categoryName: row.category_name ?? 'ไม่ระบุหมวดหมู่',
    brand: row.brand,
    price: Number(row.price),
    originalPrice: row.original_price !== null ? Number(row.original_price) : undefined,
    discountPct: round(discountPercent(row), 1),
    rating: Number(row.rating),
    reviewCount: Number(row.review_count),
    energySavingPercent:
      row.energy_saving_percent !== null ? Number(row.energy_saving_percent) : undefined,
    inStock: !!row.in_stock,
    isFlashSale: !!row.is_flash_sale,
    clusterId,
  };
}

function analyzeProductClusters(rows, requestedK) {
  const n = rows.length;
  const kMax = Math.max(2, Math.min(6, Math.floor(n / 3)));
  if (requestedK !== undefined && (requestedK < 2 || requestedK > kMax)) {
    const error = new Error(`จำนวนกลุ่มต้องอยู่ระหว่าง 2 ถึง ${kMax}`);
    error.status = 400;
    throw error;
  }

  const { matrix, stats } = buildProductFeatures(rows);
  const evaluated = [];
  for (let candidateK = 2; candidateK <= kMax; candidateK += 1) {
    const result = kmeans(matrix, candidateK);
    evaluated.push({
      k: candidateK,
      inertia: round(result.inertia, 4),
      silhouette: round(silhouetteScore(matrix, result.assignments, candidateK), 4),
      result,
    });
  }

  const automatic = evaluated.reduce((best, candidate) =>
    candidate.silhouette > best.silhouette ? candidate : best
  );
  const selected = requestedK === undefined
    ? automatic
    : evaluated.find((candidate) => candidate.k === requestedK);
  const tierOrder = selected.result.centroids
    .map((centroid, id) => ({
      id,
      price: restoreFeatureValue(centroid[0], stats[0]),
    }))
    .sort((a, b) => a.price - b.price);
  const tierById = new Map(tierOrder.map((cluster, index) => [cluster.id, index]));

  const memberRowsById = selected.result.centroids.map((_, id) =>
    rows.filter((__, index) => selected.result.assignments[index] === id)
  );
  const priceSeparated = pricesFormCleanTiers(
    tierOrder.map(({ id }) => {
      const prices = memberRowsById[id].map((row) => Number(row.price));
      return { minPrice: Math.min(...prices), maxPrice: Math.max(...prices) };
    })
  );

  const clusters = selected.result.centroids.map((centroid, id) => {
    const memberRows = memberRowsById[id];
    const summary = summarizeCluster(memberRows);
    const { centroidZ, restored } = centroidObjects(centroid, stats);
    const tierIndex = tierById.get(id);
    return {
      id,
      tierIndex,
      label: clusterLabel(selected.k, tierIndex, centroidZ, priceSeparated),
      color: CLUSTER_COLORS[tierIndex % CLUSTER_COLORS.length],
      size: memberRows.length,
      centroid: restored,
      centroidZ,
      summary,
      recommendations: buildRecommendations(centroidZ, summary, memberRows.length),
      productIds: memberRows.map((row) => row.id),
    };
  }).sort((a, b) => a.tierIndex - b.tierIndex);

  return {
    status: 'ok',
    generatedAt: new Date().toISOString(),
    productCount: n,
    chosenK: selected.k,
    kSelection: {
      range: evaluated.map((candidate) => candidate.k),
      candidates: evaluated.map(({ k, inertia, silhouette }) => ({ k, inertia, silhouette })),
      method: 'silhouette',
      reliable: n >= 20,
    },
    features: stats,
    kpis: buildKpis(rows, selected.k),
    clusters,
    products: rows.map((row, index) =>
      toClusteredProduct(row, selected.result.assignments[index])
    ),
  };
}

module.exports = { analyzeProductClusters };
