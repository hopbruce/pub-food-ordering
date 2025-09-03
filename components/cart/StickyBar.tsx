// components/cart/StickyBar.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "./CartContext";

export default function StickyBar() {
  const { items, totals } = useCart();
  const [sum, setSum] = useState({ total: 0 });

  useEffect(() => {
    setSum({ total: totals()?.total ?? 0 });
  }, [items, totals]);

  const count = items.length;
  if (count === 0) return null;

  return (
    <div className="fixed bottom-3 left-0 right-0 flex justify-center pointer-events-none">
      <Link
        href="/basket"
        className="pointer-events-auto rounded-full bg-amber-600 text-black px-4 py-3 font-medium shadow"
      >
        {count} item{count > 1 ? "s" : ""} • £{sum.total.toFixed(2)} — View Basket
      </Link>
    </div>
  );
}
