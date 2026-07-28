import { apiRequest } from '@/api/client';
import { Coupon } from '@/types/shop';

export const couponsApi = {
  list: (token: string) => apiRequest<Coupon[]>('/coupons', { token }),
};
