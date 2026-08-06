import { apiRequest } from '@/api/client';
import { Order } from '@/types/shop';

export const ordersApi = {
  /** Creates an order from the cart items currently marked `selected`. */
  create: (token: string, addressId: number, couponCode?: string | null) =>
    apiRequest<Order>('/orders', { method: 'POST', token, body: { addressId, couponCode } }),

  list: (token: string) => apiRequest<Order[]>('/orders', { token }),

  detail: (token: string, id: number) => apiRequest<Order>(`/orders/${id}`, { token }),
};
