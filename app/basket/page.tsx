"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CartProvider, useCart } from "@/components/cart/CartContext";

export default function BasketPage() {
  return (
    <CartProvider>
      <BasketInner />
    </CartProvider>
  );
}

function BasketInner() {
  const { cart, updateQty, removeItem, subtotal, count, clear } = useCart();
  const [settings, setSettings] = useState<{kitchenOpen:boolean; serviceChargePercent:number}>({kitchenOpen:true, serviceChargePercent:0});
  useEffect(()=>{ fetch("/api/kitchen").then(r=>r.json()).then(setSettings).catch(()=>{}); },[]);

  const service = Math.round((subtotal * settings.serviceChargePercent)) / 100;
  const total = subtotal + service;

  const [tableNumber, setTableNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [allergies, setAllergies] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function placeOrder() {
    setError(null);
    if (!settings.kitchenOpen) { setError("Kitchen closed"); return; }
    if (cart.length===0) { setError("Basket is empty"); return; }
    if (!tableNumber.trim()) { setError("Table number is required"); return; }
    setPending(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, tableNumber, contactName, phone, allergies })
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to place order");
      clear();
      const params = new URLSearchParams({ id: data.orderId, sms: data.smsPending ? "pending" : "sent" });
      window.location.href = `/order/${data.orderId}?${params.toString()}`;
    } catch (e:any) {
      setError(e.message || "Error");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <h1 className="text-2xl font-semibold">Basket</h1>
        {!settings.kitchenOpen && <div className="card border-red-700">Kitchen closed — checkout disabled.</div>}
        {cart.length === 0 ? (
          <div className="card">
            <p>Your basket is empty.</p>
            <Link href="/" className="btn btn-primary mt-3">Back to menu</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((it)=>(
              <div key={it.slug} className="card flex items-start gap-3">
                <div className="flex-1">
                  <div className="font-medium">{it.name}</div>
                  {it.notes && <div className="text-sm opacity-70">Notes: {it.notes}</div>}
                  <div className="text-sm opacity-70">£{it.price.toFixed(2)} each</div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="sr-only" htmlFor={`qty-${it.slug}`}>Quantity</label>
                  <input id={`qty-${it.slug}`} type="number" min={1} value={it.qty} onChange={e=>updateQty(it.slug, Math.max(1, Number(e.target.value)||1))} className="w-20"/>
                  <button className="btn border border-neutral-700" onClick={()=>removeItem(it.slug)} aria-label={`Remove ${it.name}`}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <aside className="space-y-4">
        <div className="card space-y-3">
          <h2 className="font-semibold">Checkout</h2>
          <div>
            <label>Table number *</label>
            <input value={tableNumber} onChange={(e)=>setTableNumber(e.target.value)} required aria-required="true"/>
          </div>
          <div>
            <label>Contact name (optional)</label>
            <input value={contactName} onChange={(e)=>setContactName(e.target.value)} />
          </div>
          <div>
            <label>Phone (optional)</label>
            <input value={phone} onChange={(e)=>setPhone(e.target.value)} inputMode="tel" />
          </div>
          <div>
            <label>Allergies/Notes</label>
            <textarea value={allergies} onChange={(e)=>setAllergies(e.target.value)} rows={3} placeholder="e.g., peanut allergy, no cheese…" />
          </div>
          <div className="text-sm opacity-70">Payment: <span className="font-medium">Pay at bar</span></div>
          <div className="border-t border-neutral-800 pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>£{subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Service ({settings.serviceChargePercent}%)</span><span>£{service.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>£{total.toFixed(2)}</span></div>
          </div>
          {error && <div role="alert" className="text-red-400">{error}</div>}
          <button className="btn btn-primary w-full" onClick={placeOrder} disabled={!settings.kitchenOpen || pending || cart.length===0}>
            {pending ? "Placing…" : "Place order"}
          </button>
        </div>
        <div className="text-xs opacity-70">We use your info only to process this order.</div>
      </aside>
    </div>
  );
}
