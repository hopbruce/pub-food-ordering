// lib/cart.ts
import { findItem } from "./menu";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function normalize(incoming: Partial<CartItem> & { slug: string; qty?: number }) {
  const fromMenu = findItem(incoming.slug);
  const name = incoming.name ?? fromMenu?.name ?? incoming.slug;
  const price = typeof incoming.price === "number" ? incoming.price : Number(fromMenu?.price ?? 0) || 0;
  const qty = Math.max(1, Number(incoming.qty ?? 1) || 1);
  const notes = incoming.notes || "";
  return { slug: incoming.slug, name, price, qty, notes } as CartItem;
}

/** calculate money totals (servicePercent = 0..1) */
export function totals(items: CartItem[], servicePercent = 0) {
  // fill any missing prices from the menu defensively
  const fixed = items.map((i) => normalize(i));
  const subtotal = round2(fixed.reduce((s, it) => s + it.price * it.qty, 0));
  const service = round2(subtotal * (servicePercent || 0));
  const total = round2(subtotal + service);
  return { subtotal, service, total };
}

export function addToCart(items: CartItem[], incoming: Partial<CartItem> & { slug: string; qty?: number }) {
  const norm = normalize(incoming);
  const idx = items.findIndex(
    (i) => i.slug === norm.slug && (i.notes || "") === (norm.notes || "")
  );
  if (idx >= 0) {
    const copy = [...items];
    copy[idx] = { ...normalize(copy[idx]), qty: copy[idx].qty + norm.qty };
    return copy;
    }
  return [...items, norm];
}

export function updateQty(items: CartItem[], slug: string, qty: number) {
  const copy = items.map((i) => normalize(i));
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
    return parsed.map((i) => normalize(i));
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("cart", JSON.stringify(items.map((i) => normalize(i))));
  } catch {}
}
