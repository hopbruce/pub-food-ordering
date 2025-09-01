"use client";
export const dynamic = "force-dynamic";

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

export default function BasketPage() {
  const { items, updateQty, removeItem, clear } = useCart();
  const [tableNumber, setTableNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [allergies, setAllergies] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    kitchenOpen: true,
    serviceChargePercent: 0,
  });

  useEffect(() => {
    fetch("/api/kitchen")
      .then((r) => r.json())
      .then((s) => setSettings({ kitchenOpen: !!s.kitchenOpen, serviceChargePercent: s.serviceChargePercent ?? 0 }))
      .catch(() => {});
  }, []);

  const subtotal = useMemo(
    ()
