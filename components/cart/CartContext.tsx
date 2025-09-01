// components/cart/CartContext.tsx
"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/cart";
import {
  addToCart as addFn,
  updateQty as updateFn,
  removeFromCart as removeFn,
  loadCart,
  saveCart,
  totals as totalsFn,
} from "@/lib/cart";

type CartCtx = {
  items: CartItem[];
  add: (input: { slug: string; qty?: number; notes?: string; name?: string; price?: number }) => void;
  updateQty: (slug: string, qty: number) => void;
  removeItem: (slug: string) => void;
  clear: () => void;
  totals: (servicePercent?: number) => { subtotal: number; service: number; total: number };
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // initial load from localStorage
  useEffect(() => {
    setItems(loadCart());
  }, []);

  // keep localStorage in sync
  useEffect(() => {
    if (typeof window !== "undefined") saveCart(items);
  }, [items]);

  const api: CartCtx = useMemo(
    () => ({
      items,
      add: (input) => setItems((prev) => addFn(prev, input)),
      updateQty: (slug, qty) => setItems((prev) => updateFn(prev, slug, qty)),
      removeItem: (slug) => setItems((prev) => removeFn(prev, slug)),
      clear: () => setItems([]),
      totals: (servicePercent = 0) => totalsFn(items, servicePercent),
    }),
    [items]
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
