import { secureStorage } from '@/utils/secure-storage';

const KEY = 'chaje_recent_searches';
const MAX_ITEMS = 8;

/** Recent search terms, stored locally (reuses the same storage as the auth token). */
export const searchHistory = {
  async list(): Promise<string[]> {
    const raw = await secureStorage.getItem(KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async add(term: string): Promise<string[]> {
    const trimmed = term.trim();
    if (!trimmed) return searchHistory.list();
    const current = await searchHistory.list();
    const next = [trimmed, ...current.filter((t) => t !== trimmed)].slice(0, MAX_ITEMS);
    await secureStorage.setItem(KEY, JSON.stringify(next));
    return next;
  },

  async clear(): Promise<void> {
    await secureStorage.removeItem(KEY);
  },
};
