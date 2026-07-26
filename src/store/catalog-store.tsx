import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { catalogApi } from '@/api/catalog';
import categoriesFallback from '@/data/categories.json';
import productsFallback from '@/data/products.json';
import { CATEGORIES_URL, PRODUCTS_URL, USE_REMOTE_DATA } from '@/config';
import { Category, Product } from '@/types/product';

/**
 * Loads the product catalogue with a 3-step fallback chain:
 *   1. The Express API (server/ — MySQL on the school server)
 *   2. JSON hosted on GitHub (src/config.ts)
 *   3. JSON bundled with the app (src/data/*.json)
 *
 * The bundled JSON is used as the initial value so the UI has data on the very
 * first render (no loading flash), then gets replaced once a better source
 * succeeds.
 */
interface CatalogContextValue {
  products: Product[];
  categories: Category[];
  /** True while a remote fetch is in flight. */
  loading: boolean;
  /** Set when every remote source failed (bundled data is used instead). */
  error: string | null;
  /** Which source the current data came from. */
  source: 'api' | 'github' | 'bundled';
  getProductById: (id: string) => Product | undefined;
  getProductsByCategory: (categoryId: string) => Product[];
  flashSaleProducts: Product[];
  recommendedProducts: Product[];
  /** Re-runs the fallback chain — used for pull-to-refresh. */
  refresh: () => void;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

// The JSON is untyped at compile time; assert it matches our domain types.
const bundledProducts = productsFallback as Product[];
const bundledCategories = categoriesFallback as Category[];

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(bundledProducts);
  const [categories, setCategories] = useState<Category[]>(bundledCategories);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'api' | 'github' | 'bundled'>('bundled');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);

      // 1) Try the Express API first — the real backend for this project.
      try {
        const [apiProducts, apiCategories] = await Promise.all([
          catalogApi.listProducts(),
          catalogApi.listCategories(),
        ]);
        if (cancelled) return;
        setProducts(apiProducts);
        setCategories(apiCategories);
        setSource('api');
        setError(null);
        setLoading(false);
        return;
      } catch {
        // fall through to GitHub
      }

      // 2) Try GitHub JSON (skip if disabled or still using the placeholder URL).
      if (USE_REMOTE_DATA && !PRODUCTS_URL.includes('<')) {
        try {
          const [pRes, cRes] = await Promise.all([fetch(PRODUCTS_URL), fetch(CATEGORIES_URL)]);
          if (!pRes.ok || !cRes.ok) throw new Error(`HTTP ${pRes.status}/${cRes.status}`);
          const [pJson, cJson] = await Promise.all([pRes.json(), cRes.json()]);
          if (cancelled) return;
          setProducts(pJson as Product[]);
          setCategories(cJson as Category[]);
          setSource('github');
          setError(null);
          setLoading(false);
          return;
        } catch (e) {
          if (cancelled) return;
          setError(e instanceof Error ? e.message : 'fetch failed');
        }
      }

      // 3) Give up — keep the bundled fallback already in state.
      if (!cancelled) {
        setSource('bundled');
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

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
      source,
      getProductById,
      getProductsByCategory,
      flashSaleProducts: products.filter((p) => p.isFlashSale),
      recommendedProducts: products.filter((p) => !p.isFlashSale),
      refresh,
    }),
    [products, categories, loading, error, source, getProductById, getProductsByCategory, refresh]
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
