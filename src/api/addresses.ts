import { apiRequest } from '@/api/client';
import { Address, AddressInput } from '@/types/shop';

export const addressesApi = {
  list: (token: string) => apiRequest<Address[]>('/addresses', { token }),

  create: (token: string, input: AddressInput) =>
    apiRequest<Address>('/addresses', { method: 'POST', token, body: input }),

  update: (token: string, id: number, input: Partial<AddressInput>) =>
    apiRequest<Address>(`/addresses/${id}`, { method: 'PATCH', token, body: input }),

  remove: (token: string, id: number) =>
    apiRequest<{ ok: true }>(`/addresses/${id}`, { method: 'DELETE', token }),
};
