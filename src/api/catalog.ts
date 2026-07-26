import { apiRequest } from '@/api/client';
import { Category, Product } from '@/types/product';

interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export const catalogApi = {
  /** Fetches every product in one page — the catalogue is small (a dozen items). */
  listProducts: async (): Promise<Product[]> => {
    const res = await apiRequest<ProductListResponse>('/products?limit=100');
    return res.items;
  },

  listCategories: () => apiRequest<Category[]>('/categories'),
};
