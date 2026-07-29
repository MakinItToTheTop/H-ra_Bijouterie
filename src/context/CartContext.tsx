"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/data/products";

type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  /** False until localStorage has been read — lets the UI show a skeleton
   *  instead of flashing "panier vide" on first paint. */
  hydrated: boolean;
  /** IDs of products whose quantity was reduced or removed because the
   *  server-side stock dropped below what was in the local cart. */
  stockAdjustedIds: string[];
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  /** Re-fetches live stock/price for everything in the cart and clamps
   *  quantities accordingly. Returns the product IDs that were adjusted.
   *  Safe to call manually (e.g. before checkout). */
  refreshStock: () => Promise<string[]>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "hera-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [stockAdjustedIds, setStockAdjustedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(STORAGE_KEY);
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    // Don't overwrite the stored cart with the empty initial state.
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* quota or private mode — the cart just won't persist */
    }
  }, [items, hydrated]);

  // Cart items are a snapshot taken at add-to-cart time. If another
  // customer buys the last unit(s) in the meantime, that snapshot goes
  // stale: the item would silently stay in the cart with an outdated
  // stock/price. `refreshStock` re-pulls the live product list and clamps
  // (or drops) quantities so the cart always reflects real availability.
  const refreshStock = useCallback(async (): Promise<string[]> => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (!data.ok) return [];

      const freshById = new Map<string, Product>(
        (data.products as Product[]).map((p) => [p.id, p]),
      );

      let adjustedOut: string[] = [];

      setItems((current) => {
        const adjusted: string[] = [];

        const next = current
          .map((item) => {
            const fresh = freshById.get(item.product.id);
            if (!fresh) return item; // produit introuvable (supprimé) : on le laisse, l'API commande le rejettera

            const clampedQty = Math.min(item.quantity, Math.max(0, fresh.stock));
            if (clampedQty !== item.quantity) adjusted.push(item.product.id);

            return { product: fresh, quantity: clampedQty };
          })
          .filter((item) => item.quantity > 0);

        adjustedOut = adjusted;
        if (adjusted.length > 0) setStockAdjustedIds(adjusted);
        return next;
      });

      return adjustedOut;
    } catch {
      // Pas de réseau : on garde le panier local tel quel, l'API commande
      // fera de toute façon un dernier contrôle de stock.
      return [];
    }
  }, []);

  // Run once, right after the cart has been read from localStorage.
  useEffect(() => {
    if (!hydrated) return;
    refreshStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    const ceiling = Math.max(1, product.stock ?? 1);

    setItems((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, ceiling) }
            : item,
        );
      }

      return [...current, { product, quantity: Math.min(quantity, ceiling) }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: Math.max(0, Math.min(quantity, Math.max(1, item.product.stock ?? 1))),
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.product.id !== productId));
    setStockAdjustedIds((current) => current.filter((id) => id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setStockAdjustedIds([]);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items],
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotal,
      hydrated,
      stockAdjustedIds,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      refreshStock,
    }),
    [
      items,
      itemCount,
      subtotal,
      hydrated,
      stockAdjustedIds,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      refreshStock,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return context;
}