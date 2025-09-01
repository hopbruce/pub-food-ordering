// app/basket/BasketClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { useCart } from "@/components/cart/CartContext";

type CartItem = {
  slug: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
};

type Settings = { kitchenOpen: boolean; serviceChargePercent: number };

function money(n: number) {
  return `£${(Math.round(n * 100) / 100).toFixed(2)}`;
}

export default function BasketClient() {
  const cart = useCart() as
    | { items?: CartItem[]; updateQty: (s: string, q: number) => void; removeItem: (s: string) => void; clear: () => void }
    | undefined;

  // guard against undefined context during any SSR pass
  const items: CartItem[] = Array.isArray(cart?.items) ? (cart!.items as CartItem[]) : [];
  const updateQty = cart?.updateQty ?? (() => {});
  const removeItem = cart?.removeItem ?? (() => {});
  const clear = cart?.clear ?? (() => {});

  const [tableNumber, setTableNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [allergies, setAllergies] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState<Settings>({ kitchenOpen: true, serviceChargePercent: 0 });

  useEffect(() => {
    fetch("/api/kitchen")
      .then((r) => r.json())
      .then((s) => setSettings({ kitchenOpen: !!s.kitchenOpen, serviceChargePercent: s.serviceChargePercent ?? 0 }))
      .catch(() => {});
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.price * it.qty, 0), [items]);
  const service = useMemo(() => subtotal * (settings.serviceChargePercent || 0), [subtotal, settings]);
  const total = subtotal + service;

  const disabled = !settings.kitchenOpen || items.length === 0 || !String(tableNumber).trim() || submitting;

  async function placeOrderPayAtBar() {
    if (disabled) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.slug, qty: i.qty, notes: i.notes || "" })),
          tableNumber,
          contactName,
          phone,
          allergies,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        clear();
        window.location.href = `/success?orderId=${encodeURIComponent(data.orderId)}`;
      } else {
        alert(data.message || "Could not place order");
      }
    } catch {
      alert("Something went wrong placing the order.");
    } finally {
      setSubmitting(false);
    }
  }

  async function payNow() {
    if (disabled) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/pay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.slug, qty: i.qty, notes: i.notes || "" })),
          tableNumber,
          contactName,
          phone,
          allergies,
        }),
      });
      const data = await res.json();
      if (data.ok && data.url) {
        window.location.href = data.url; // Stripe Checkout (Apple/Google Pay supported)
      } else {
        alert(data.message || "Could not start payment");
      }
    } catch {
      alert("Something went wrong starting payment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Basket</h1>

      {/* basket items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="space-y-3">
          {items.length === 0 && <p className="text-neutral-300">Your basket is empty.</p>}
          {items.map((it) => (
            <div key={it.slug} className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-neutral-400">{money(it.price)} each</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  aria-label={`Decrease ${it.name}`}
                  onClick={() => updateQty(it.slug, Math.max(1, it.qty - 1))}
                  className="px-3 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700"
                >
                  −
                </button>
                <div className="min-w-[2.5rem] text-center">{it.qty}</div>
                <button
                  aria-label={`Increase ${it.name}`}
                  onClick={() => updateQty(it.slug, it.qty + 1)}
                  className="px-3 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700"
                >
                  +
                </button>
                <button
                  aria-label={`Remove ${it.name}`}
                  onClick={() => removeItem(it.slug)}
                  className="ml-3 px-3 py-2 rounded-md bg-neutral-700 hover:bg-neutral-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* checkout */}
        <aside className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
          {!settings.kitchenOpen && (
            <div className="mb-3 rounded-md bg-red-900/30 border border-red-700 px-3 py-2 text-sm">
              Kitchen is closed — checkout disabled.
            </div>
          )}

          <h2 className="text-xl font-semibold mb-3">Checkout</h2>

          <label className="block text-sm mb-1">Table number *</label>
          <input
            className="w-full mb-3 rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            inputMode="numeric"
            placeholder="e.g., 12"
          />

          <label className="block text-sm mb-1">Contact name (optional)</label>
          <input
            className="w-full mb-3 rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Your name"
          />

          <label className="block text-sm mb-1">Phone (optional)</label>
          <input
            className="w-full mb-3 rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="07…"
          />

          <label className="block text-sm mb-1">Allergies/Notes</label>
          <textarea
            className="w-full mb-4 rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 h-24"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="e.g., peanut allergy, no cheese…"
          />

          <div className="text-sm text-neutral-400 mb-2">Payment:</div>
          <div className="text-sm text-neutral-300 mb-4">
            Pay at bar, or use the button below for card / Apple Pay / Google Pay.
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service ({Math.round((settings.serviceChargePercent || 0) * 100)}%)</span>
              <span>{money(service)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={placeOrderPayAtBar}
            disabled={disabled}
            className={clsx(
              "w-full mt-4 rounded-md px-4 py-3 font-medium",
              disabled ? "bg-neutral-700 text-neutral-400" : "bg-amber-600 hover:bg-amber-500 text-black"
            )}
          >
            Place order (Pay at bar)
          </button>

          <button
            type="button"
            onClick={payNow}
            disabled={disabled}
            className={clsx(
              "w-full mt-2 rounded-md px-4 py-3 font-medium",
              disabled ? "bg-neutral-700 text-neutral-400" : "bg-white text-black hover:bg-neutral-200"
            )}
            aria-label="Pay with card, Apple Pay or Google Pay"
            title="Pay with card, Apple Pay or Google Pay"
          >
            Pay now • Apple Pay • Google Pay
          </button>
        </aside>
      </div>

      <p className="mt-6 text-sm text-neutral-400">
        Food Allergies & Intolerances: please speak to staff about the ingredients in your meal.
      </p>
    </main>
  );
}
