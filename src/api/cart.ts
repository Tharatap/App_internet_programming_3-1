import { apiRequest } from '@/api/client';

/**
 * Server cart rows carry only a light product summary (name/price/image) —
 * the shop-store hydrates the full `Product` from the already-loaded catalogue
 * by `productId` instead of trusting this summary, so it always matches the
 * up-to-date price/stock shown elsewhere in the app.
 */
export interface CartApiItem {
  productId: string;
  quantity: number;
  selected: boolean;
}

export const cartApi = {
  get: (token: string) => apiRequest<CartApiItem[]>('/cart', { token }),

  addItem: (token: string, productId: string, quantity = 1) =>
    apiRequest<{ ok: true }>('/cart/items', { method: 'POST', token, body: { productId, quantity } }),

  updateItem: (
    token: string,
    productId: string,
    changes: { quantity?: number; selected?: boolean }
  ) =>
    apiRequest<{ ok: true }>(`/cart/items/${productId}`, {
      method: 'PATCH',
      token,
      body: changes,
    }),

  removeItem: (token: string, productId: string) =>
    apiRequest<{ ok: true }>(`/cart/items/${productId}`, { method: 'DELETE', token }),

  setAllSelected: (token: string, selected: boolean) =>
    apiRequest<{ ok: true }>('/cart/select-all', { method: 'PATCH', token, body: { selected } }),
};
