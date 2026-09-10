import type { ClusterPalette } from '@/constants/theme';

export type ClusterColorKey = (typeof ClusterPalette)[number];
export type RecommendationPriority = 'high' | 'medium' | 'low';

export interface KSelectionCandidate {
  k: number;
  inertia: number;
  silhouette: number;
}

export interface ClusterRecommendation {
  title: string;
  reason: string;
  priority: RecommendationPriority;
}

export interface FeatureStats {
  key: string;
  label: string;
  transform: 'log' | 'linear';
  mean: number;
  std: number;
  min: number;
  max: number;
  median: number;
}

export interface ClusterCentroid {
  price: number;
  discountPct: number;
  rating: number;
  reviewCount: number;
  energySaving: number;
}

export interface ProductCluster {
  id: number;
  tierIndex: number;
  label: string;
  color: ClusterColorKey;
  size: number;
  centroid: ClusterCentroid;
  centroidZ: ClusterCentroid;
  summary: {
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    /** null เมื่อไม่มีสินค้าที่มีรีวิวเลยในกลุ่มนี้ — ต้องแสดง "ยังไม่มีรีวิว" ไม่ใช่ 0.0 */
    avgRating: number | null;
    ratedCount: number;
    totalReviews: number;
    avgDiscountPct: number;
    avgEnergySaving: number;
    outOfStockCount: number;
    topCategories: { id: string; name: string; count: number }[];
    topBrands: { name: string; count: number }[];
  };
  recommendations: ClusterRecommendation[];
  productIds: string[];
}

export interface ClusteredProduct {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discountPct: number;
  rating: number;
  reviewCount: number;
  energySavingPercent?: number;
  inStock: boolean;
  isFlashSale: boolean;
  clusterId: number;
}

export interface AnalyticsKpis {
  productCount: number;
  clusterCount: number;
  avgPrice: number;
  medianPrice: number;
  priceRange: [number, number];
  /** null เมื่อยังไม่มีสินค้าที่มีรีวิวเลยทั้งร้าน */
  avgRating: number | null;
  noReviewCount: number;
  totalReviews: number;
  discountedCount: number;
  outOfStockCount: number;
  flashSaleCount: number;
}

export interface SuccessfulClusterAnalysis {
  status: 'ok';
  generatedAt: string;
  productCount: number;
  chosenK: number;
  kSelection: {
    range: number[];
    candidates: KSelectionCandidate[];
    method: 'silhouette';
    reliable: boolean;
  };
  features: FeatureStats[];
  kpis: AnalyticsKpis;
  clusters: ProductCluster[];
  products: ClusteredProduct[];
}

export interface InsufficientClusterAnalysis {
  status: 'insufficient_data';
  productCount: number;
  message: string;
}

export type ClusterAnalysis = SuccessfulClusterAnalysis | InsufficientClusterAnalysis;
