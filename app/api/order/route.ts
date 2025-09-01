// app/api/order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

import { findItem } from "@/lib/menu";
import { getSettings } from "@/lib/settings";
import { addOrder } from "@/lib/orders";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs"; // ensure Node runtime (we use fs in lib/orders)

type ClientItem = { slug: string; qty: number; notes?: string };

function money(n: number) {
  return Math.round(n * 100) / 100;
}

export async function POST(req: NextRequest) {
  try {
    // very light rate limit on this IP
    const ip =
      req.headers.get("x-forwarded-for") ||
      (req as any).ip ||
      "anonymous";
    const rl = rateLimit(`order:${ip}`, 20, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { ok: false, message: "Too many requests, please wait a moment." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    const body = (await req.json()) as {
      items: ClientItem[];
      tableNumber: string | number;
      contactName?: string;
      phone?: string;
      allergies?: string;
    };

    if (!Array.isArray(body.items) || !body.items.length) {
      return NextResponse.json(
        { ok: false, message: "Basket is empty." },
        { status: 400 }
      );
    }
    if (!body.tableNumber && body.tableNumber !== 0) {
      return NextResponse.json(
        { ok: false, message: "Table number is required." },
        { status: 400 }
      );
    }

    const settings = getSettings();
    let subtotal = 0;

    const normalized = body.items.map((ci) => {
      const db = findItem(ci.slug);
      if (!db) throw new Error(`Unknown item: ${ci.slug}`);
      const qty = Math.max(1, Number(ci.qty) || 1);
      const priceEach = Number(db.price) || 0;
      subtotal += priceEach * qty;
      return {
        slug: ci.slug,
        name: db.name,
        price: priceEach,
        qty,
        notes: ci.notes || "",
      };
    });

    subtotal = money(subtotal);
    const service = money(subtotal * (settings.serviceChargePercent || 0));
    const total = money(subtotal + service);

    const orderId = uuidv4().slice(0, 8).toUpperCase();
    const placedAt = new Date().toISOString();

    // persist (file-backed with in-memory fallback)
    addOrder({
      orderId,
      tableNumber: String(body.tableNumber),
      items: normalized,
      subtotal,
      service,
      total,
      allergies: body.allergies || "",
      placedAt,
      smsStatus: "pending",
    });

    // Try SMS if Twilio env vars exist — but never fail the order
    try {
      const sid = process.env.TWILIO_ACCOUNT_SID;
      const token = process.env.TWILIO_AUTH_TOKEN;
      const from = process.env.TWILIO_FROM;
      const to = process.env.ORDER_SMS_TO;
      if (sid && token && from && to) {
        const twilio = (await import("twilio")).default(sid, token);
        const lines = normalized
          .map(
            (i) =>
              `- ${i.qty} x ${i.name} (£${i.price.toFixed(2)})${
                i.notes ? ` ${i.notes}` : ""
              }`
          )
          .join("\n");
        const sms = `NEW PUB ORDER #${orderId}
Table: ${body.tableNumber}
Items:
${lines}
Subtotal: £${subtotal.toFixed(2)}  Service: £${service.toFixed(
          2
        )}  Total: £${total.toFixed(2)}
Allergies/Notes: ${body.allergies || "None"}
Placed: ${placedAt}`;
        await twilio.messages.create({ from, to, body: sms });
      }
    } catch (e) {
      console.error("Twilio SMS error (ignored):", e);
    }

    return NextResponse.json({
      ok: true,
      orderId,
      etaMinutes: 15,
      kitchenOpen: settings.kitchenOpen,
    });
  } catch (err: any) {
    console.error("Order route error:", err);
    return NextResponse.json(
      { ok: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
