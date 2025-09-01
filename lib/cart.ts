// lib/cart.ts
export type CartItem = {
  slug: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
};

/** calculate money totals (servicePercent = 0..1) */
export function totals(items: CartItem[], servicePercent = 0) {
  const subtotal = round2(items.reduce((s, it) => s + it.price * it.qty, 0));
  const service = round2(subtotal * (servicePercent || 0));
  const total = round2(subtotal + service);
  return { subtotal, service, total };
}

export function addToCart(items: CartItem[], incoming: CartItem) {
  const idx = items.findIndex(
    (i) => i.slug === incoming.slug && (i.notes || "") === (incoming.notes || "")
  );
  if (idx >= 0) {
    const copy = [...items];
    copy[idx] = { ...copy[idx], qty: copy[idx].qty + incoming.qty };
    return copy;
  }
  return [...items, incoming];
}

export function updateQty(items: CartItem[], slug: string, qty: number) {
  const copy = [...items];
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
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("cart", JSON.stringify(items));
  } catch {}
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
