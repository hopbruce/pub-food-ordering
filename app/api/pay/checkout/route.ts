// app/api/pay/checkout/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { findItem } from "@/lib/menu";
import { getSettings } from "@/lib/settings";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

function toMinor(n: number) {
  return Math.round((Number(n) || 0) * 100);
}

export async function POST(req: NextRequest) {
  try {
    const { items, tableNumber, contactName, phone, allergies } =
      (await req.json()) as {
        items: { slug: string; qty: number; notes?: string }[];
        tableNumber: string | number;
        contactName?: string;
        phone?: string;
        allergies?: string;
      };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, message: "Basket empty" }, { status: 400 });
    }
    if (!tableNumber && tableNumber !== 0) {
      return NextResponse.json({ ok: false, message: "Table number required" }, { status: 400 });
    }

    const settings = getSettings();

    const norm = items.map((ci) => {
      const db = findItem(ci.slug);
      if (!db) throw new Error(`Unknown item: ${ci.slug}`);
      const qty = Math.max(1, Number(ci.qty) || 1);
      return { name: db.name, qty, unit_amount: toMinor(db.price) };
    });

    const line_i_
