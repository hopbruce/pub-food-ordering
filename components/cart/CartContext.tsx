"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartLine, MenuItem } from "@/lib/types";
import { addToCart as add, removeFromCart as remove, updateQty as update, totals } from "@/lib/cart";

type CartCtx = {
  cart: CartLine[];
  addItem: (item: MenuItem, qty?: number, notes?: string) => void;
  updateQty: (slug: string, qty: number) => void;
  removeItem: (slug: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("pub_cart");
      if (raw) setCart(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("pub_cart", JSON.stringify(cart));
  }, [cart]);

  const api: CartCtx = useMemo(() => {
    const t = totals(cart);
    return {
      cart,
      addItem: (item, qty = 1, notes) => setCart((c) => add(c, item, qty, notes)),
      updateQty: (slug, qty) => setCart((c) => update(c, slug, qty)),
      removeItem: (slug) => setCart((c) => remove(c, slug)),
      clear: () => setCart([]),
      count: t.count,
      subtotal: t.subtotal,
    };
  }, [cart]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("No CartProvider");
  return ctx;
}
