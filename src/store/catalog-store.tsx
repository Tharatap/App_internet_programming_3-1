import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import categoriesFallback from '@/data/categories.json';
import productsFallback from '@/data/products.json';
import { CATEGORIES_URL, PRODUCTS_URL, USE_REMOTE_DATA } from '@/config';
import { Category, Product } from '@/types/product';

/**
 * Loads the product catalogue from JSON hosted on GitHub (see `src/config.ts`).
 *
 * The bundled JSON files are used as the initial value so the UI has data on the
 * very first render (no loading flash) and as a fallback if the network request
 * fails. When the remote fetch succeeds, the data is replaced with the latest.
 */
interface CatalogContextValue {
  products: Product[];
  categories: Category[];
  /** True while the remote fetch is in flight. */
  loading: boolean;
  /** Set when the remote fetch failed (bundled data is used instead). */
  error: string | null;
  /** True once data is being served from the remote source. */
  isRemote: boolean;
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (categoryId: string) => Product[];
  flashSaleProducts: Product[];
  recommendedProducts: Product[];
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

// The JSON is untyped at compile time; assert it matches our domain types.
const bundledProducts = productsFallback as Product[];
const bundledCategories = categoriesFallback as Category[];

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(bundledProducts);
  const [categories, setCategories] = useState<Category[]>(bundledCategories);
  const [loading, setLoading] = useState<boolean>(USE_REMOTE_DATA);
  const [error, setError] = useState<string | null>(null);
  const [isRemote, setIsRemote] = useState<boolean>(false);

  useEffect(() => {
    // Skip the network call when disabled, or when the repo URL is still the
    // unconfigured placeholder (contains "<USER>"/"<REPO>").
    if (!USE_REMOTE_DATA || PRODUCTS_URL.includes('<')) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([fetch(PRODUCTS_URL), fetch(CATEGORIES_URL)]);
        if (!pRes.ok || !cRes.ok) {
          throw new Error(`HTTP ${pRes.status}/${cRes.status}`);
        }
        const [pJson, cJson] = await Promise.all([pRes.json(), cRes.json()]);
        if (cancelled) return;
        setProducts(pJson as Product[]);
        setCategories(cJson as Category[]);
        setIsRemote(true);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        // Keep the bundled fallback data already in state.
        setError(e instanceof Error ? e.message : 'fetch failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const getProductById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products]
  );
  const getProductsByCategory = useCallback(
    (categoryId: string) => products.filter((p) => p.categoryId === categoryId),
    [products]
  );

  const value = useMemo<CatalogContextValue>(
    () => ({
      products,
      categories,
      loading,
      error,
      isRemote,
      getProductById,
      getProductsByCategory,
      flashSaleProducts: products.filter((p) => p.isFlashSale),
      recommendedProducts: products.filter((p) => !p.isFlashSale),
    }),
    [products, categories, loading, error, isRemote, getProductById, getProductsByCategory]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return ctx;
}
