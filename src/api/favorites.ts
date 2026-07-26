import { apiRequest } from '@/api/client';

export const favoritesApi = {
  /** Returns the list of product ids the user has favorited. */
  get: (token: string) => apiRequest<string[]>('/favorites', { token }),

  toggle: (token: string, productId: string) =>
    apiRequest<{ favorited: boolean }>(`/favorites/${productId}`, { method: 'POST', token }),
};
