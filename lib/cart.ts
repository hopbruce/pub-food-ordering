// lib/cart.ts
import { findItem } from "@/lib/menu";

export type CartItem = { slug: string; qty: number };
export type Cart = CartItem[];

export const addToCart = (cart: Cart, slug: string, qty = 1): Cart => {
  const idx = cart.findIndex((c) => c.slug === slug);
  if (idx >= 0) {
    const copy = [...cart];
    copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
    return copy;
  }
  return [...cart, { slug, qty }];
};

export const setQty = (cart: Cart, slug: string, qty: number): Cart =>
  cart
    .map((c) => (c.slug === slug ? { ...c, qty } : c))
    .filter((c) => c.qty > 0);

export const removeFromCart = (cart: Cart, slug: string): Cart =>
  cart.filter((c) => c.slug !== slug);

export const totals = (cart: Cart): { count: number; subtotal: number } => {
  let count = 0;
  let subtotal = 0;
  for (const c of cart) {
    const item = findItem(c.slug);
    if (!item) continue; // ignore unknowns
    count += c.qty;
    subtotal += (item.price || 0) * c.qty;
  }
  return { count, subtotal };
};
