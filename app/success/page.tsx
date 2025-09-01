"use client";
import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const sid = new URLSearchParams(window.location.search).get("session_id");
    if (!sid) return setStatus("error");
    fetch(`/api/pay/confirm?session_id=${encodeURIComponent(sid)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setOrderId(d.orderId);
          setStatus("ok");
          localStorage.removeItem("cart");
        } else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading") {
    return <main className="p-6 text-white">Verifying payment…</main>;
  }
  if (status === "error") {
    return (
      <main className="p-6 text-white">
        Payment verification failed. Please speak to staff or try again.
      </main>
    );
  }

  return (
    <main className="p-6 text-white">
      <h1 className="text-2xl font-semibold mb-2">Thanks! Your order is paid.</h1>
      <p>
        Order ID: <strong>{orderId}</strong>
      </p>
      <p className="mt-4">We’re starting your order. Enjoy! 🍻</p>
    </main>
  );
}
