const FEATURE_DEFS = [
  {
    key: 'price',
    label: 'ราคา',
    transform: 'log',
    extract: (row) => Number(row.price),
  },
  {
    key: 'discountPct',
    label: 'ส่วนลด %',
    transform: 'linear',
    extract: (row) => {
      const price = Number(row.price);
      const originalPrice = Number(row.original_price);
      return row.original_price !== null && originalPrice > price
        ? ((originalPrice - price) / originalPrice) * 100
        : 0;
    },
  },
  {
    key: 'rating',
    label: 'คะแนนรีวิว',
    transform: 'linear',
    // ยังไม่มีรีวิว = ไม่มีข้อมูล ไม่ใช่ "ได้ 0 ดาว" — สินค้าที่เพิ่มผ่านหน้าแอดมินจะได้ rating 0.0
    // จาก default ของ schema ถ้าปล่อยให้เป็น 0 จริง มันจะกลายเป็นค่าสุดขั้วที่ดึง centroid เพี้ยนทั้งกลุ่ม
    // จึงคืน null ให้ไปเข้ากลไกเติมด้วย median ด้านล่างแทน (ไม่ทำแบบเดียวกันกับ reviewCount
    // เพราะ "รีวิว 0 ครั้ง" เป็นความจริงที่ใช้คำนวณได้ ไม่ใช่ข้อมูลขาด)
    extract: (row) => (Number(row.review_count) > 0 ? Number(row.rating) : null),
  },
  {
    key: 'reviewCount',
    label: 'จำนวนรีวิว',
    transform: 'log',
    extract: (row) => Number(row.review_count),
  },
  {
    key: 'energySaving',
    label: 'ประหยัดไฟ %',
    transform: 'linear',
    extract: (row) => row.energy_saving_percent,
  },
];

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function finiteNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function buildProductFeatures(rows) {
  const columns = FEATURE_DEFS.map((definition) => {
    const extracted = rows.map((row) => definition.extract(row));
    const validValues = extracted
      .map(finiteNumber)
      .filter((value) => value !== null);
    const medianValue = median(validValues);
    const imputed = extracted.map((value) => {
      const numeric = finiteNumber(value);
      return numeric === null ? medianValue : numeric;
    });
    const transformed = imputed.map((value) =>
      definition.transform === 'log' ? Math.log1p(Math.max(0, value)) : value
    );
    const mean = transformed.reduce((sum, value) => sum + value, 0) / transformed.length;
    const variance = transformed.reduce(
      (sum, value) => sum + (value - mean) ** 2,
      0
    ) / transformed.length;
    const std = Math.sqrt(variance);

    return {
      values: transformed.map((value) => (std === 0 ? 0 : (value - mean) / std)),
      stats: {
        key: definition.key,
        label: definition.label,
        transform: definition.transform,
        mean,
        std,
        min: Math.min(...imputed),
        max: Math.max(...imputed),
        median: medianValue,
      },
    };
  });

  return {
    matrix: rows.map((_, rowIndex) => columns.map((column) => column.values[rowIndex])),
    featureDefs: FEATURE_DEFS,
    stats: columns.map((column) => column.stats),
  };
}

function restoreFeatureValue(zScore, stat) {
  const transformed = zScore * stat.std + stat.mean;
  return stat.transform === 'log' ? Math.expm1(transformed) : transformed;
}

module.exports = { FEATURE_DEFS, buildProductFeatures, restoreFeatureValue };
