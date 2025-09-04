// app/api/pay/demo/route.ts
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { findItem } from "@/lib/menu";
import { getSettings } from "@/lib/settings";
import { addOrder } from "@/lib/orders";

function toPounds(pence: number) {
  return Math.round(pence) / 100;
}
function toPence(pounds: number) {
  return Math.round(pounds * 100);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const itemsRaw =
      Array.isArray(body.items) ? (body.items as any[]) : ([] as any[]);

    // Validate & price items server-side
    const items = itemsRaw.map((ci) => {
      const db = findItem(ci.slug);
      if (!db || typeof db.price !== "number" || db.price <= 0) {
        throw new Error("Invalid item");
      }
      const qty = Math.max(1, Number(ci.qty || 1));
      return {
        slug: db.slug!,
        name: db.name,
        priceEach: db.price,
        qty,
        notes: typeof ci.notes === "string" ? ci.notes : undefined,
        lineTotal: toPounds(toPence(db.price) * qty),
      };
    });

    const subtotalP = items.reduce(
      (sum, it) => sum + toPence(it.priceEach) * it.qty,
      0
    );

    const settings = getSettings();
    const servicePercent =
      typeof settings?.serviceChargePercent === "number"
        ? settings.serviceChargePercent
        : 0;

    const serviceP = Math.round((subtotalP * servicePercent) / 100);
    const totalP = subtotalP + serviceP;

    const orderId = uuidv4();
    const order = {
      id: orderId,
      ts: new Date().toISOString(),
      table: String(body.tableNumber || "").trim(),
      name: typeof body.name === "string" ? body.name.trim() : "",
      phone: typeof body.phone === "string" ? body.phone.trim() : "",
      notes: typeof body.notes === "string" ? body.notes.trim() : "",
      items: items.map((i) => ({
        name: i.name,
        qty: i.qty,
        priceEach: i.priceEach,
        notes: i.notes,
      })),
      subtotal: toPounds(subtotalP),
      servicePercent,
      service: toPounds(serviceP),
      total: toPounds(totalP),
      status: "paid-demo",
      smsPending: false,
    };

    addOrder(order);

    return NextResponse.json({
      ok: true,
      orderId,
      receiptUrl: `/receipt/${orderId}?demo=1`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Bad request" },
      { status: 400 }
    );
  }
}
