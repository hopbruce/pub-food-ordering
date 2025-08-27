import type { CartLine, MenuItem } from "./types";

export function addToCart(cart: CartLine[], item: MenuItem, qty = 1, notes?: string): CartLine[] {
  const idx = cart.findIndex((c) => c.slug === item.slug && (c.notes || "") === (notes || ""));
  if (idx >= 0) {
    const copy = [...cart];
    copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty };
    return copy;
  }
  return [...cart, { slug: item.slug, name: item.name, price: item.price, qty, notes }];
}

export function updateQty(cart: CartLine[], slug: string, qty: number): CartLine[] {
  return cart
    .map((c) => (c.slug === slug ? { ...c, qty } : c))
    .filter((c) => c.qty > 0);
}

export function removeFromCart(cart: CartLine[], slug: string): CartLine[] {
  return cart.filter((c) => c.slug !== slug);
}

export function totals(cart: CartLine[]): { count: number; subtotal: number } {
  const subtotal = Math.round(cart.reduce((s, c) => s + c.price * c.qty, 0) * 100) / 100;
  const count = cart.reduce((s, c) => s + c.qty, 0);
  return { count, subtotal };
}
