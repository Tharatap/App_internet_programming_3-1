import type { ClusterColorKey } from '@/types/analytics';

/** relative = เทียบราคาภายในร้านตัวเอง · absolute = ราคาจริงของทั้งตลาดรวมกัน */
export type MarketMode = 'relative' | 'absolute';

export interface StoreSource {
  id: string;
  name: string;
  kind: string;
  status: 'ok' | 'failed';
  productCount: number;
  /** มีเฉพาะตอน status === 'failed' */
  error?: string;
}

export interface StoreShare {
  storeId: string;
  storeName: string;
  count: number;
  share: number;
}

export interface MarketCluster {
  id: number;
  tierIndex: number;
  label: string;
  color: ClusterColorKey;
  size: number;
  priceRange: [number, number];
  avgPrice: number;
  medianPrice: number;
  storeBreakdown: StoreShare[];
}

export interface TierShare {
  tierIndex: number;
  label: string;
  count: number;
  share: number;
}

export interface StoreProfile {
  storeId: string;
  storeName: string;
  productCount: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  medianPrice: number;
  distribution: TierShare[];
  dominantTierIndex: number;
  dominantTierLabel: string;
  dominantShare: number;
}

export interface MarketProduct {
  key: string;
  storeId: string;
  storeName: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  /** ตำแหน่งราคาภายในร้านตัวเอง 0 = ถูกสุดของร้าน, 1 = แพงสุดของร้าน */
  percentileInStore: number;
  clusterId: number;
  tierIndex: number;
}

interface MarketOk {
  status: 'ok';
  generatedAt: string;
  mode: MarketMode;
  modeLabel: string;
  k: number;
  silhouette: number;
  productCount: number;
  storeCount: number;
  sources: StoreSource[];
  clusters: MarketCluster[];
  storeProfiles: StoreProfile[];
  products: MarketProduct[];
}

interface MarketInsufficient {
  status: 'insufficient_data';
  mode: MarketMode;
  productCount: number;
  sources: StoreSource[];
  message: string;
}

export type MarketAnalysis = MarketOk | MarketInsufficient;
