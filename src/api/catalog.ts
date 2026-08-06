import { apiRequest } from '@/api/client';
import { Category, Product, ProductInput } from '@/types/product';

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

  /** แอดมินเท่านั้น — เพิ่มสินค้าใหม่ */
  createProduct: (token: string, input: ProductInput) =>
    apiRequest<Product>('/products', { method: 'POST', token, body: input }),

  /** แอดมินเท่านั้น — แก้ไขสินค้าเดิม */
  updateProduct: (token: string, id: string, input: ProductInput) =>
    apiRequest<Product>(`/products/${id}`, { method: 'PUT', token, body: input }),

  /** แอดมินเท่านั้น — ลบสินค้า */
  deleteProduct: (token: string, id: string) =>
    apiRequest<void>(`/products/${id}`, { method: 'DELETE', token }),
};
