// app/api/payments/create-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_CURRENCY } from "@/lib/stripe";
import { findItem } from "@/lib/menu";
import { enforceSameOrigin } from "@/lib/cors";
import { getSettings } from "@/lib/settings";

export async function POST(req: NextRequest) {
  const forbid = enforceSameOrigin(req);
  if (forbid) return forbid;

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const body = await req.json();
  const items = Array.isArray(body.items) ? body.items : [];
  if (items.length === 0) {
    return NextResponse.json({ error: "Basket empty" }, { status: 400 });
  }

  // Recalculate server-side (don’t trust client)
  let subtotal = 0;
  const validated: { slug: string; name: string; price: number; qty: number }[] = [];
  for (const it of items) {
    const slug = String(it.slug || "");
    const qty = Math.max(1, Number(it.qty) || 1);
    const found = findItem(slug);
    if (!found) return NextResponse.json({ error: "Invalid item" }, { status: 400 });
    subtotal += found.price * qty;
    validated.push({ slug, name: found.name, price: found.price, qty });
  }

  const { serviceChargePercent } = getSettings();
  const service = Math.round(subtotal * serviceChargePercent) / 100;
  const total = subtotal + service;

  const amount = Math.round(total * 100); // pence

  try {
    const pi = await stripe.paymentIntents.create({
      amount,
      currency: STRIPE_CURRENCY,
      automatic_payment_methods: { enabled: true },
      metadata: { app: "pub-food-ordering" },
    });
    return NextResponse.json({ clientSecret: pi.client_secret });
  } catch (e) {
    console.error("Stripe PI error:", e);
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}
