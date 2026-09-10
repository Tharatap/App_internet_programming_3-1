const KMEANS_SEED = 42;

function mulberry32(seed) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function squaredDistance(a, b) {
  let total = 0;
  for (let index = 0; index < a.length; index += 1) {
    const difference = a[index] - b[index];
    total += difference * difference;
  }
  return total;
}

function initializeCentroids(points, k, random) {
  const centroids = [points[Math.floor(random() * points.length)].slice()];

  while (centroids.length < k) {
    const distances = points.map((point) =>
      Math.min(...centroids.map((centroid) => squaredDistance(point, centroid)))
    );
    const total = distances.reduce((sum, distance) => sum + distance, 0);

    if (total === 0) {
      const fallback = points.find((point) =>
        !centroids.some((centroid) => squaredDistance(point, centroid) === 0)
      );
      centroids.push((fallback ?? points[centroids.length % points.length]).slice());
      continue;
    }

    let threshold = random() * total;
    let selectedIndex = distances.length - 1;
    for (let index = 0; index < distances.length; index += 1) {
      threshold -= distances[index];
      if (threshold <= 0) {
        selectedIndex = index;
        break;
      }
    }
    centroids.push(points[selectedIndex].slice());
  }

  return centroids;
}

function assignPoints(points, centroids) {
  return points.map((point) => {
    let closest = 0;
    let closestDistance = squaredDistance(point, centroids[0]);
    for (let clusterId = 1; clusterId < centroids.length; clusterId += 1) {
      const distance = squaredDistance(point, centroids[clusterId]);
      if (distance < closestDistance) {
        closest = clusterId;
        closestDistance = distance;
      }
    }
    return closest;
  });
}

function recalculateCentroids(points, assignments, k, previousCentroids) {
  const dimension = points[0].length;
  const counts = Array(k).fill(0);
  const sums = Array.from({ length: k }, () => Array(dimension).fill(0));

  assignments.forEach((clusterId, pointIndex) => {
    counts[clusterId] += 1;
    for (let featureIndex = 0; featureIndex < dimension; featureIndex += 1) {
      sums[clusterId][featureIndex] += points[pointIndex][featureIndex];
    }
  });

  // ย้ายจุดจากกลุ่มที่ยังเหลือสมาชิกได้ เพื่อให้ทุก centroid มีข้อมูลจริงและไม่กลายเป็น NaN
  for (let emptyId = 0; emptyId < k; emptyId += 1) {
    if (counts[emptyId] !== 0) continue;

    let farthestIndex = -1;
    let farthestDistance = -1;
    assignments.forEach((clusterId, pointIndex) => {
      if (counts[clusterId] <= 1) return;
      const distance = squaredDistance(points[pointIndex], previousCentroids[clusterId]);
      if (distance > farthestDistance) {
        farthestDistance = distance;
        farthestIndex = pointIndex;
      }
    });

    if (farthestIndex === -1) {
      farthestIndex = emptyId % points.length;
    }

    const donorId = assignments[farthestIndex];
    counts[donorId] -= 1;
    counts[emptyId] += 1;
    assignments[farthestIndex] = emptyId;
    for (let featureIndex = 0; featureIndex < dimension; featureIndex += 1) {
      sums[donorId][featureIndex] -= points[farthestIndex][featureIndex];
      sums[emptyId][featureIndex] += points[farthestIndex][featureIndex];
    }
  }

  return sums.map((sum, clusterId) =>
    sum.map((value) => value / counts[clusterId])
  );
}

function runOnce(points, k, options, seedOffset) {
  const random = mulberry32(options.seed + seedOffset);
  let centroids = initializeCentroids(points, k, random);
  let assignments = Array(points.length).fill(0);
  let converged = false;
  let iterations = 0;

  for (let iteration = 0; iteration < options.maxIter; iteration += 1) {
    assignments = assignPoints(points, centroids);
    const nextCentroids = recalculateCentroids(points, assignments, k, centroids);
    const movement = Math.max(
      ...centroids.map((centroid, clusterId) =>
        Math.sqrt(squaredDistance(centroid, nextCentroids[clusterId]))
      )
    );
    centroids = nextCentroids;
    iterations = iteration + 1;
    if (movement < options.tolerance) {
      converged = true;
      break;
    }
  }

  assignments = assignPoints(points, centroids);
  centroids = recalculateCentroids(points, assignments, k, centroids);
  const inertia = points.reduce(
    (total, point, pointIndex) =>
      total + squaredDistance(point, centroids[assignments[pointIndex]]),
    0
  );

  return { assignments, centroids, inertia, iterations, converged };
}

function kmeans(points, k, options = {}) {
  if (!Array.isArray(points) || points.length === 0) {
    throw new Error('ต้องมีข้อมูลสำหรับจัดกลุ่มอย่างน้อย 1 จุด');
  }
  if (!Number.isInteger(k) || k < 1 || k > points.length) {
    throw new Error('จำนวนกลุ่มไม่สอดคล้องกับจำนวนข้อมูล');
  }
  const dimension = points[0].length;
  if (dimension === 0 || points.some((point) => point.length !== dimension)) {
    throw new Error('ข้อมูลแต่ละจุดต้องมีจำนวนคุณลักษณะเท่ากัน');
  }

  const resolvedOptions = {
    seed: options.seed ?? KMEANS_SEED,
    nInit: options.nInit ?? 10,
    maxIter: options.maxIter ?? 100,
    tolerance: options.tolerance ?? 1e-6,
  };

  let best = null;
  for (let restart = 0; restart < resolvedOptions.nInit; restart += 1) {
    const result = runOnce(points, k, resolvedOptions, restart);
    if (!best || result.inertia < best.inertia) best = result;
  }
  return best;
}

function silhouetteScore(points, assignments, k) {
  const n = points.length;
  if (n === 0 || k >= n) return 0;

  const members = Array.from({ length: k }, () => []);
  assignments.forEach((clusterId, pointIndex) => members[clusterId].push(pointIndex));
  if (members.every((cluster) => cluster.length <= 1)) return 0;

  const scores = points.map((point, pointIndex) => {
    const ownId = assignments[pointIndex];
    const ownMembers = members[ownId];
    if (ownMembers.length <= 1) return 0;

    const a = ownMembers
      .filter((otherIndex) => otherIndex !== pointIndex)
      .reduce(
        (sum, otherIndex) => sum + Math.sqrt(squaredDistance(point, points[otherIndex])),
        0
      ) / (ownMembers.length - 1);

    let b = Infinity;
    members.forEach((cluster, clusterId) => {
      if (clusterId === ownId || cluster.length === 0) return;
      const average = cluster.reduce(
        (sum, otherIndex) => sum + Math.sqrt(squaredDistance(point, points[otherIndex])),
        0
      ) / cluster.length;
      if (average < b) b = average;
    });

    const denominator = Math.max(a, b);
    return denominator === 0 || !Number.isFinite(denominator) ? 0 : (b - a) / denominator;
  });

  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

module.exports = { KMEANS_SEED, kmeans, silhouetteScore, mulberry32 };
