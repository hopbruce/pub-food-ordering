export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// app/api/pay/confirm/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { findItem } from "@/lib/menu";
import { getSettings } from "@/lib/settings";
import { addOrder } from "@/lib/orders";
import { v4 as uuidv4 } from "uuid";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

function money(n: number) {
  return Math.round(n * 100) / 100;
}

export async function GET(req: NextRequest) {
  try {
    const session_id = new URL(req.url).searchParams.get("session_id");
    if (!session_id)
      return NextResponse.json({ ok: false, message: "Missing session_id" }, { status: 400 });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ ok: false, message: "Payment not completed" }, { status: 400 });
    }

    const md = session.metadata || {};
    const itemsRaw = md.items ? JSON.parse(md.items) : [];
    const settings = getSettings();

    let subtotal = 0;
    const normalized = (itemsRaw as any[]).map((ci) => {
      const db = findItem(ci.slug);
      if (!db)
