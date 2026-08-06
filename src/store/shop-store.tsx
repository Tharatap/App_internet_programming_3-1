import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Alert } from 'react-native';

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
    // Guest cart/favorites captured at the moment login flips isAuthenticated —
    // isAuthenticated/token changing always re-runs this effect on a fresh render,
    // so this closure always sees the guest state as it was right before login.
    const guestCart = cart;
    const guestFavorites = favorites;
    (async () => {
      try {
        let [serverCart, serverFavorites] = await Promise.all([
          cartApi.get(token),
          favoritesApi.get(token),
        ]);
        if (cancelled) return;

        const hasGuestState = guestCart.length > 0 || guestFavorites.size > 0;
        if (hasGuestState) {
          // Merge guest-only cart items into the server cart: sum quantities on
          // overlap (capped at 99, matching QuantityStepper's max), add the rest.
          const serverCartByProduct = new Map(serverCart.map((row) => [row.productId, row]));
          await Promise.all(
            guestCart.map((item) => {
              const serverRow = serverCartByProduct.get(item.product.id);
              if (serverRow) {
                const mergedQty = Math.min(99, serverRow.quantity + item.quantity);
                return mergedQty === serverRow.quantity
                  ? Promise.resolve()
                  : cartApi.updateItem(token, item.product.id, { quantity: mergedQty });
              }
              return cartApi.addItem(token, item.product.id, item.quantity);
            })
          );

          // Merge guest favorites: only toggle ids not already favorited on the server.
          const serverFavoriteSet = new Set(serverFavorites);
          await Promise.all(
            [...guestFavorites]
              .filter((id) => !serverFavoriteSet.has(id))
              .map((id) => favoritesApi.toggle(token, id))
          );

          if (cancelled) return;
          [serverCart, serverFavorites] = await Promise.all([
            cartApi.get(token),
            favoritesApi.get(token),
          ]);
          if (cancelled) return;
        }

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
      let snapshot: CartItem[] = [];
      setCart((prev) => {
        snapshot = prev;
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
      if (token) {
        cartApi.addItem(token, product.id, quantity).catch(() => {
          setCart(snapshot);
          Alert.alert('เพิ่มสินค้าลงตะกร้าไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
        });
      }
    },
    [token]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      let snapshot: CartItem[] = [];
      setCart((prev) => {
        snapshot = prev;
        return prev.filter((item) => item.product.id !== productId);
      });
      if (token) {
        cartApi.removeItem(token, productId).catch(() => {
          setCart(snapshot);
          Alert.alert('ลบสินค้าไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
        });
      }
    },
    [token]
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      let snapshot: CartItem[] = [];
      setCart((prev) => {
        snapshot = prev;
        return quantity <= 0
          ? prev.filter((item) => item.product.id !== productId)
          : prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item));
      });
      if (token) {
        const request = quantity <= 0
          ? cartApi.removeItem(token, productId)
          : cartApi.updateItem(token, productId, { quantity });
        request.catch(() => {
          setCart(snapshot);
          Alert.alert('เปลี่ยนจำนวนไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
        });
      }
    },
    [token]
  );

  const toggleCartSelected = useCallback(
    (productId: string) => {
      let snapshot: CartItem[] = [];
      let nextSelected = true;
      setCart((prev) => {
        snapshot = prev;
        return prev.map((item) => {
          if (item.product.id !== productId) return item;
          nextSelected = !item.selected;
          return { ...item, selected: nextSelected };
        });
      });
      if (token) {
        cartApi.updateItem(token, productId, { selected: nextSelected }).catch(() => {
          setCart(snapshot);
          Alert.alert('เลือกสินค้าไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
        });
      }
    },
    [token]
  );

  const setAllSelected = useCallback(
    (selected: boolean) => {
      let snapshot: CartItem[] = [];
      setCart((prev) => {
        snapshot = prev;
        return prev.map((item) => ({ ...item, selected }));
      });
      if (token) {
        cartApi.setAllSelected(token, selected).catch(() => {
          setCart(snapshot);
          Alert.alert('เลือกสินค้าทั้งหมดไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
        });
      }
    },
    [token]
  );

  const toggleFavorite = useCallback(
    (productId: string) => {
      let snapshot: Set<string> = new Set();
      setFavorites((prev) => {
        snapshot = prev;
        const next = new Set(prev);
        if (next.has(productId)) {
          next.delete(productId);
        } else {
          next.add(productId);
        }
        return next;
      });
      if (token) {
        favoritesApi.toggle(token, productId).catch(() => {
          setFavorites(snapshot);
          Alert.alert('อัปเดตรายการโปรดไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง');
        });
      }
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
