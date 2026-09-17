import { apiRequest } from '@/api/client';
import type { MarketAnalysis, MarketMode } from '@/types/market';

export const marketApi = {
  /** แอดมินเท่านั้น — จัดกลุ่มสินค้าข้ามร้านในกลุ่มด้วยราคา */
  getMarketClusters: (token: string, mode: MarketMode, k = 3) =>
    apiRequest<MarketAnalysis>(`/analytics/market-clusters?mode=${mode}&k=${k}`, { token }),
};
