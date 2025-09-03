// app/basket/BasketClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";

function money(n: number) {
  return `£${(Math.round((n || 0) * 100) / 100).toFixed(2)}`;
}

export default function BasketClient() {
  const { items, add, updateQty, removeItem, totals } = useCart();

  // Basic checkout fields (table required)
  const [tableNumber, setTableNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // ✅ Rehydrate from localStorage on first mount (the previous snippet referenced `cart` by mistake)
  useEffect(() => {
    if (items.length === 0) {
      try {
        const parsed = JSON.parse(localStorage.getItem("cart") || "[]");
        if (Array.isArray(parsed) && parsed.length) {
          parsed.forEach((i: any) => add(i)); // use the hook's `add`
        }
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute totals (0% service here; server will re-check on order)
  const t = useMemo(() => totals(0), [items, totals]);
  const canSubmit = items.length > 0 && tableNumber.trim().length > 0;

  return (
    <main className="max-w-6xl mx-auto p-4 grid gap-6 md:grid-cols-[1fr_380px]">
      {/* Basket list */}
      <section>
        <h1 className="text-2xl font-semibold text-white mb-3">Basket</h1>

        {items.length === 0 ? (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6 text-neutral-300">
            Your basket is empty.{" "}
            <Link href="/" className="underline">
              Go to menu
            </Link>
            .
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((i) => (
              <div
                key={`${i.slug}:${i.notes || ""}`}
                className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-white font-medium truncate">{i.name}</div>
                  {!!i.notes && (
                    <div className="text-xs text-neutral-400 mt-1 truncate">
                      Notes: {i.notes}
                    </div>
                  )}
                  <div className="text-xs text-neutral-400 mt-1">
                    {money(i.price)} each
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 bg-neutral-800 rounded-md text-white"
                    onClick={() => updateQty(i.slug, Math.max(1, i.qty - 1))}
                    aria-label={`Decrease ${i.name}`}
                  >
                    –
                  </button>
                  <div className="w-10 text-center">{i.qty}</div>
                  <button
                    className="px-3 py-2 bg-neutral-200 text-black rounded-md"
                    onClick={() => updateQty(i.slug, i.qty + 1)}
                    aria-label={`Increase ${i.name}`}
                  >
                    +
                  </button>
                  <button
                    className="ml-2 px-3 py-2 bg-neutral-700 text-white rounded-md"
                    onClick={() => removeItem(i.slug)}
                    aria-label={`Remove ${i.name}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Checkout card */}
      <aside className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 h-fit">
        <h2 className="text-lg font-semibold text-white mb-3">Checkout</h2>

        <label className="block text-sm text-neutral-300 mb-1">Table number *</label>
        <input
          className="w-full rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2 text-white mb-3"
          placeholder="1"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
        />

        <label className="block text-sm text-neutral-300 mb-1">Contact name (optional)</label>
        <input
          className="w-full rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2 text-white mb-3"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
        />

        <label className="block text-sm text-neutral-300 mb-1">Phone (optional)</label>
        <input
          className="w-full rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2 text-white mb-3"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <label className="block text-sm text-neutral-300 mb-1">Allergies/Notes</label>
        <textarea
          className="w-full rounded-md bg-neutral-950 border border-neutral-800 px-3 py-2 text-white mb-4"
          rows={3}
          placeholder="e.g., peanut allergy, no cheese…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="text-sm text-neutral-300 space-y-1 mb-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{money(t.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Service (0%)</span>
            <span>{money(t.service)}</span>
          </div>
          <div className="flex justify-between font-semibold text-white">
            <span>Total</span>
            <span>{money(t.total)}</span>
          </div>
        </div>

        <div className="text-xs text-neutral-400 mb-3">
          Payment: <strong>Pay at bar</strong> (card/payments coming soon)
        </div>

        <button
          disabled={!canSubmit}
          className={`w-full rounded-md px-4 py-3 font-medium ${
            canSubmit
              ? "bg-amber-600 text-black"
              : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
          }`}
          onClick={() => alert("Demo: order submission not wired in this client-only view yet.")}
        >
          Place order
        </button>
      </aside>
    </main>
  );
}
