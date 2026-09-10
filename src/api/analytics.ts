import { apiRequest } from '@/api/client';
import type { ClusterAnalysis } from '@/types/analytics';

export const analyticsApi = {
  getProductClusters: (token: string, k?: number) =>
    apiRequest<ClusterAnalysis>(`/analytics/product-clusters${k ? `?k=${k}` : ''}`, { token }),
};
