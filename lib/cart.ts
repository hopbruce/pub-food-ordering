// lib/cart.ts
import { findItem } from "./menu";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
};

const R2 = (n: number) => Math.round(n * 100) / 100;

function normalize(raw: Partial<CartItem> & { slug: string; qty?: number }): CartItem {
  const db = findItem(raw.slug);
  const name = raw.name ?? db?.name ?? raw.slug;
  const price = typeof raw.price === "number" ? raw.price : Number(db?.price ?? 0) || 0;
  const qty = Math.max(1, Number(raw.qty ?? 1) || 1);
  const notes = raw.notes || "";
  return { slug: raw.slug, name, price, qty, notes };
}

export function totals(items: CartItem[], servicePercent = 0) {
  const fixed = items.map(normalize);
  const subtotal = R2(fixed.reduce((s, it) => s + it.price * it.qty, 0));
  const service = R2(subtotal * (servicePercent || 0));
  const total = R2(subtotal + service);
  return { subtotal, service, total };
}

export function addToCart(items: CartItem[], incoming: Partial<CartItem> & { slug: string; qty?: number }) {
  const next = normalize(incoming);
  const idx = items.findIndex((i) => i.slug === next.slug && (i.notes || "") === (next.notes || ""));
  if (idx >= 0) {
    const copy = items.slice();
    copy[idx] = { ...normalize(copy[idx]), qty: copy[idx].qty + next.qty };
    return copy;
  }
  return [...items, next];
}

export function updateQty(items: CartItem[], slug: string, qty: number) {
  const copy = items.map(normalize);
  const i = copy.findIndex((x) => x.slug === slug);
  if (i >= 0) copy[i] = { ...copy[i], qty: Math.max(1, Number(qty) || 1) };
  return copy;
}

export function removeFromCart(items: CartItem[], slug: string) {
  return items.filter((x) => x.slug !== slug);
}

export function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("cart");
    const parsed = raw ? (JSON.parse(raw) as any[]) : [];
    return parsed.map(normalize);
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("cart", JSON.stringify(items.map(normalize)));
  } catch {}
}
