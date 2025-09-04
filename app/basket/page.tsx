// app/basket/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart/CartContext";

type Srv = { kitchenOpen: boolean; serviceChargePercent?: number };

export const dynamic = "force-dynamic";

export default function BasketPage() {
  const { items, update, remove } = useCart();
  const [table, setTable] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [srv, setSrv] = useState<Srv>({ kitchenOpen: true, serviceChargePercent: 0 });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // pull service charge + kitchen open from our existing endpoint
    fetch("/api/kitchen", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setSrv({ kitchenOpen: !!d.kitchenOpen, serviceChargePercent: d.serviceChargePercent || 0 }))
      .catch(() => {});
  }, []);

  const subtotal = useMemo(
    () => items.reduce((s: number, it: any) => s + it.price * it.qty, 0),
    [items]
  );
  const service = useMemo(
    () => Math.round((subtotal * (srv.serviceChargePercent || 0)) ) / 100,
    [subtotal, srv.serviceChargePercent]
  );
  const total = useMemo(() => subtotal + service, [subtotal, service]);

  const canPay = items.length > 0 && table.trim() !== "" && srv.kitchenOpen && !busy;

  async function payDemo() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/pay/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: table,
          name,
          phone,
          notes,
          items: items.map((i: any) => ({ slug: i.slug, qty: i.qty, notes: i.notes })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Payment failed");
      window.location.href = data.receiptUrl as string;
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-slate-900">Basket</h1>

      {!srv.kitchenOpen && (
        <div className="mt-4 rounded-md bg-yellow-50 text-yellow-900 px-4 py-3 border border-yellow-200">
          Kitchen is closed. Ordering is disabled.
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <section className="lg:col-span-2 space-y-4">
          {items.map((it: any) => (
            <div key={it.slug} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
              <div>
                <div className="font-medium text-slate-900">{it.name}</div>
                <div className="text-sm text-slate-600">£{it.price.toFixed(2)} each</div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={it.qty}
                  onChange={(e) => update(it.slug, Math.max(1, Number(e.target.value)))}
                  className="w-16 rounded-md border border-slate-300 bg-white px-2 py-1 text-center"
                />
                <button
                  onClick={() => remove(it.slug)}
                  className="text-sm rounded-md border px-3 py-1 border-slate-300 text-slate-700 hover:border-blue-400"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-slate-600">
              Your basket is empty.
            </div>
          )}
        </section>

        {/* Checkout */}
        <aside className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Checkout</h2>

          <label className="block text-sm">
            <span className="text-slate-700">Table number *</span>
            <input
              value={table}
              onChange={(e) => setTable(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:ring-2 focus:ring-blue-600"
              placeholder="e.g., 12"
            />
          </label>

          <label className="block text-sm">
            <span className="text-slate-700">Contact name (optional)</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            <span className="text-slate-700">Phone (optional)</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            <span className="text-slate-700">Allergies/Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
              placeholder="e.g., peanut allergy"
            />
          </label>

          <div className="pt-2 text-sm text-slate-700 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="tabular-nums">£{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Service ({srv.serviceChargePercent || 0}%)</span>
              <span className="tabular-nums">£{service.toFixed(2)}</span>
            </div>
            <div className="h-px bg-slate-200 my-1" />
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span className="tabular-nums">£{total.toFixed(2)}</span>
            </div>
          </div>

          {err && (
            <div className="rounded-md bg-red-50 text-red-800 px-3 py-2 text-sm border border-red-200">
              {err}
            </div>
          )}

          <button
            onClick={payDemo}
            disabled={!canPay}
            className="w-full rounded-md px-4 py-2 text-white font-medium bg-blue-600 disabled:opacity-50 hover:bg-blue-700"
          >
            {busy ? "Processing…" : "Pay (demo)"}
          </button>

          <div className="text-xs text-slate-500">
            This is a demo checkout. No real payment is taken.
          </div>
        </aside>
      </div>
    </main>
  );
}
