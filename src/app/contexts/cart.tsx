import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '../data/products';
import { getCartFromServer, replaceCartOnServer, ServerCartItemDto } from '../api/cartApi';
import { getAccessToken } from '../api/authStorage';

export type CartItem = {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedStorage?: string;
};

type CartContextValue = {
  items: CartItem[];
  cartCount: number;
  addToCart: (product: Product, quantity?: number) => void;
  buyNow: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'shopviet_cart_items';

function normalizeCart(items: CartItem[]): CartItem[] {
  return items.map((item) => ({
    ...item,
    quantity: Math.max(1, Math.round(item.quantity)),
  }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const isAuthenticated = Boolean(getAccessToken());

  useEffect(() => {
    // Always load local copy first for offline/guest experience
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        setItems(normalizeCart(parsed));
      }
    } catch {
      setItems([]);
    }

    // If user is authenticated, try to fetch server-side cart and prefer it when available
    if (isAuthenticated) {
      (async () => {
        try {
          const serverItems = await getCartFromServer();
          if (Array.isArray(serverItems) && serverItems.length > 0) {
            const mapped: CartItem[] = serverItems
              .map((si) => {
                // server may return full product snapshot or only productId; prefer product object when present
                if (si.product && typeof si.product === 'object') {
                  return {
                    product: si.product as Product,
                    quantity: Math.max(1, Math.round(si.quantity)),
                    selectedColor: si.selectedColor ?? '',
                    selectedStorage: si.selectedStorage ?? '',
                  } as CartItem;
                }
                return null;
              })
              .filter(Boolean) as CartItem[];

            if (mapped.length > 0) {
              setItems(normalizeCart(mapped));
            }
          }
        } catch (e) {
          // ignore server errors and keep local cart
          // console.error('Failed to load server cart', e);
        }
      })();
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

    // If authenticated, sync changes up to server (debounced)
    if (!isAuthenticated) return;

    const payload: ServerCartItemDto[] = items.map((it) => ({
      product: it.product,
      productId: (it.product as any)?.id,
      quantity: it.quantity,
      selectedColor: it.selectedColor,
      selectedStorage: it.selectedStorage,
    }));

    const t = window.setTimeout(() => {
      replaceCartOnServer(payload).catch(() => {
        // swallow errors; optional: show toast
      });
    }, 700);

    return () => window.clearTimeout(t);
  }, [items]);

  const cartCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const addToCart = (product: Product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...current, { product, quantity, selectedColor: '', selectedStorage: '' }];
    });
  };

  const buyNow = (product: Product, quantity = 1) => {
    addToCart(product, quantity);
  };

  const removeFromCart = (productId: number) => {
    setItems((current) => current.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{ items, cartCount, addToCart, buyNow, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
