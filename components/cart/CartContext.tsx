"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import type { Cart, CartItem } from "@/lib/cart";
import { addToCart, setQty, removeFromCart, totals } from "@/lib/cart";

type Ctx = {
  cart: Cart;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  totals: { count: number; subtotal: number };
};

const CartCtx = createContext<Ctx | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>([]);

  // load once on client
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart:v1");
      if (raw) setCart(JSON.parse(raw));
    } catch {}
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem("cart:v1", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const value = useMemo<Ctx>(
    () => ({
      cart,
      add: (slug, qty = 1) => setCart((c) => addToCart(c, slug, qty)),
      setQty: (slug, qty) => setCart((c) => setQty(c, slug, qty)),
      remove: (slug) => setCart((c) => removeFromCart(c, slug)),
      clear: () => setCart([]),
      totals: totals(cart),
    }),
    [cart]
  );

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("No CartProvider");
  return ctx;
}
