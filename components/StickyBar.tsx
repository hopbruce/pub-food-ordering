"use client";
import Link from "next/link";
import { useCart } from "./cart/CartContext";

export default function StickyBar() {
  const { count, subtotal } = useCart();
  if (count === 0) return null;
  return (
    <div className="sticky-bar">
      <div className="max-w-5xl mx-auto flex items-center gap-3">
        <div className="flex-1">
          {count} item{count>1?'s':''} • £{subtotal.toFixed(2)}
        </div>
        <Link href="/basket" className="btn btn-primary" aria-label="View Basket">
          View Basket
        </Link>
      </div>
    </div>
  );
}
