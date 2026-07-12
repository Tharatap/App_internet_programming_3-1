import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { mockProducts } from '@/data/mockProducts';
import { CartItem, Product } from '@/types/product';

/**
 * Lightweight in-memory shop store for Phase 1 (no backend). Holds the cart and
 * the favorites/wishlist set, and exposes the derived values the tabs need
 * (cart badge count, favorite lookups). Replace with real persistence/API in a
 * later phase.
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

const seedCart: CartItem[] = [
  { product: mockProducts[0], quantity: 1, selected: true },
  { product: mockProducts[2], quantity: 2, selected: true },
];

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(seedCart);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['p2', 'p5']));

  const addToCart = useCallback((product: Product, quantity = 1) => {
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
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.product.id !== productId)
        : prev.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          )
    );
  }, []);

  const toggleCartSelected = useCallback((productId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, selected: !item.selected } : item
      )
    );
  }, []);

  const setAllSelected = useCallback((selected: boolean) => {
    setCart((prev) => prev.map((item) => ({ ...item, selected })));
  }, []);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  }, []);

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
