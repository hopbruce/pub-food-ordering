"use client";

import { useEffect, useState } from "react";
import { useCart } from "../../components/cart/CartContext";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

export default function BasketPage() {
  const { cart, subtotal, clear } = useCart();
  const [tableNumber, setTableNumber] = useState("");
  const [pending, setPending] = useState(false);
  const [appleGoogleAvailable, setAppleGoogleAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      const stripe = await stripePromise;
      if (!stripe) return;
      const pr = stripe.paymentRequest({
        country: "GB",
        currency: "gbp",
        total: { label: "The Pub", amount: Math.round(subtotal * 100) },
        requestPayerName: true,
      });
      const result = await pr.canMakePayment();
      if (result) setAppleGoogleAvailable(true);
    })();
  }, [subtotal]);

  async function placeOrder() {
    if (!tableNumber) {
      alert("Please enter table number");
      return;
    }
    setPending(true);
    // this is your existing “pay at bar” fallback
    await fetch("/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart, tableNumber }),
    });
    setPending(false);
    clear();
    alert("Order placed (pay at bar).");
  }

  async function payWithAppleGoogle() {
    const stripe = await stripePromise;
    if (!stripe) return;

    // ask server for PaymentIntent
    const res = await fetch("/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart }),
    });
    const data = await res.json();
    if (!data.clientSecret) {
      alert("Payment setup failed");
      return;
    }

    const pr = stripe.paymentRequest({
      country: "GB",
      currency: "gbp",
      total: { label: "The Pub", amount: Math.round(subtotal * 100) },
      requestPayerName: true,
    });

    pr.on("paymentmethod", async (ev) => {
      const { error } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: ev.paymentMethod.id,
      });
      if (error) {
        ev.complete("fail");
        alert(error.message || "Payment failed");
      } else {
        ev.complete("success");
        clear();
        alert("Payment successful + order placed!");
      }
    });

    const result = await pr.canMakePayment();
    if (result) {
      pr.show();
    } else {
      alert("Apple/Google Pay not available here.");
    }
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl mb-4">Your Basket</h1>
      {cart.length === 0 && <p>Your basket is empty.</p>}
      {cart.map((item) => (
        <div key={item.slug} className="mb-2">
          {item.qty} × {item.name} (£{item.price.toFixed(2)})
        </div>
      ))}
      <p className="mt-4">Subtotal: £{subtotal.toFixed(2)}</p>
      <input
        type="text"
        placeholder="Table number"
        className="border p-2 w-full my-2"
        value={tableNumber}
        onChange={(e) => setTableNumber(e.target.value)}
      />

      {appleGoogleAvailable && (
        <button
          type="button"
          className="btn btn-primary w-full my-2"
          onClick={payWithAppleGoogle}
        >
          Pay with Apple / Google Pay
        </button>
      )}

      <button
        className="btn border border-neutral-700 w-full"
        onClick={placeOrder}
        disabled={pending || cart.length === 0}
      >
        {pending ? "Placing…" : "Pay at bar (fallback)"}
      </button>
    </div>
  );
}
