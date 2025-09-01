// app/api/pay/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { findItem } from "@/lib/menu";
import { getSettings } from "@/lib/settings";

export const runtime = "nodejs";

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

    // Build line items
    const norm = items.map((ci) => {
      const db = findItem(ci.slug);
      if (!db) throw new Error(`Unknown item: ${ci.slug}`);
      const qty = Math.max(1, Number(ci.qty) || 1);
      return { name: db.name, qty, unit_amount: toMinor(db.price) };
    });

    const line_items = norm.map((n) => ({
      quantity: n.qty,
      price_data: {
        currency: "gbp",
        unit_amount: n.unit_amount,
        product_data: { name: n.name },
      },
    }));

    // service charge
    const subtotalP = norm.reduce((s, n) => s + n.unit_amount * n.qty, 0);
    const serviceP = Math.round(subtotalP * (settings.serviceChargePercent || 0));
    if (serviceP > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: serviceP,
          product_data: { name: "Service charge" },
        },
      });
    }

    const origin = req.headers.get("origin") || `https://${req.headers.get("host")}`;
    const metadata = {
      tableNumber: String(tableNumber),
      contactName: contactName || "",
      phone: phone || "",
      allergies: allergies || "",
      items: JSON.stringify(items).slice(0, 3500), // keep under metadata size limit
    };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "link"], // Apple Pay / Google Pay come via 'card'
      phone_number_collection: { enabled: true },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/basket`,
      line_items,
      metadata,
      currency: "gbp",
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (e: any) {
    console.error("checkout error", e);
    return NextResponse.json({ ok: false, message: e?.message || "Server error" }, { status: 500 });
  }
}
