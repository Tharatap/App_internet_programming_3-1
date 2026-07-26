import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { cartApi } from '@/api/cart';
import { favoritesApi } from '@/api/favorites';
import { useAuth } from '@/store/auth-store';
import { useCatalog } from '@/store/catalog-store';
import { CartItem, Product } from '@/types/product';

/**
 * Cart and favorites. Signed-in users are synced with the server (server/routes/
 * cart.js, favorites.js) with optimistic local updates; guests keep everything
 * in memory only (lost on refresh) so browsing before logging in still works.
 */
interface ShopContextValue {
  cart: CartItem[];
  cartCount: number;
  selectedTotal: number;
  favorites: Set<string>;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  toggleCartSelected: (productId: string) => void;
  setAllSelected: (selected: boolean) => void;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => void;
}

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const { getProductById } = useCatalog();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Pull the signed-in user's cart/favorites from the server and hydrate full
  // Product objects from the already-loaded catalogue by id.
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setCart([]);
      setFavorites(new Set());
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [serverCart, serverFavorites] = await Promise.all([
          cartApi.get(token),
          favoritesApi.get(token),
        ]);
        if (cancelled) return;

        const hydrated: CartItem[] = serverCart
          .map((row) => {
            const product = getProductById(row.productId);
            return product ? { product, quantity: row.quantity, selected: row.selected } : null;
          })
          .filter((item): item is CartItem => item !== null);

        setCart(hydrated);
        setFavorites(new Set(serverFavorites));
      } catch {
        // Network hiccup — keep whatever was already in state.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, getProductById]);

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { product, quantity, selected: true }];
      });
      if (token) cartApi.addItem(token, product.id, quantity).catch(() => {});
    },
    [token]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      if (token) cartApi.removeItem(token, productId).catch(() => {});
    },
    [token]
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      setCart((prev) =>
        quantity <= 0
          ? prev.filter((item) => item.product.id !== productId)
          : prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
      );
      if (token) {
        if (quantity <= 0) {
          cartApi.removeItem(token, productId).catch(() => {});
        } else {
          cartApi.updateItem(token, productId, { quantity }).catch(() => {});
        }
      }
    },
    [token]
  );

  const toggleCartSelected = useCallback(
    (productId: string) => {
      let nextSelected = true;
      setCart((prev) =>
        prev.map((item) => {
          if (item.product.id !== productId) return item;
          nextSelected = !item.selected;
          return { ...item, selected: nextSelected };
        })
      );
      if (token) cartApi.updateItem(token, productId, { selected: nextSelected }).catch(() => {});
    },
    [token]
  );

  const setAllSelected = useCallback(
    (selected: boolean) => {
      setCart((prev) => prev.map((item) => ({ ...item, selected })));
      if (token) cartApi.setAllSelected(token, selected).catch(() => {});
    },
    [token]
  );

  const toggleFavorite = useCallback(
    (productId: string) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(productId)) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });
      if (token) favoritesApi.toggle(token, productId).catch(() => {});
    },
    [token]
  );

  const value = useMemo<ShopContextValue>(() => {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const selectedTotal = cart.reduce(
      (sum, item) => (item.selected ? sum + item.product.price * item.quantity : sum),
      0
    );
    return {
      cart,
      cartCount,
      selectedTotal,
      favorites,
      addToCart,
      removeFromCart,
      setQuantity,
      toggleCartSelected,
      setAllSelected,
      isFavorite: (id: string) => favorites.has(id),
      toggleFavorite,
    };
  }, [cart, favorites, addToCart, removeFromCart, setQuantity, toggleCartSelected, setAllSelected, toggleFavorite]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopContextValue {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return ctx;
}
