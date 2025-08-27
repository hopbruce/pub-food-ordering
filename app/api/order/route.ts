import { NextRequest, NextResponse } from "next/server";
import { findItem } from "@/lib/menu"; import { createOrder, updateSmsStatus } from "@/lib/orders";
import { rateLimit } from "@/lib/rateLimit"; import { enforceSameOrigin } from "@/lib/cors";
import { getSettings } from "@/lib/settings"; import { sendOrderSms } from "@/lib/sms";

function getIp(req: NextRequest){
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
}

export async function POST(req: NextRequest){
  const forbid = enforceSameOrigin(req); if(forbid) return forbid;
  const ip = getIp(req); if(!rateLimit(ip, 20, 60_000)){ return new NextResponse("Too Many Requests",{status:429}); }
  const settings = getSettings(); const body = await req.json();

  if(!settings.kitchenOpen){ return NextResponse.json({ ok:false, error:"Kitchen closed" }, { status:400 }); }

  const tableNumber = String(body.tableNumber||"").trim();
  if(!tableNumber){ return NextResponse.json({ ok:false, error:"Table number required" }, { status:400 }); }

  const items = Array.isArray(body.items)? body.items: [];
  if(items.length===0){ return NextResponse.json({ ok:false, error:"Basket empty" }, { status:400 }); }

  const validated:any[] = [];
  for (const it of items){
    const slug = String(it.slug||""); const qty = Math.max(1, Number(it.qty)||1); const notes = it.notes? String(it.notes).slice(0,140): undefined;
    const found = findItem(slug); if(!found){ return NextResponse.json({ ok:false, error:"Invalid item" }, { status:400 }); }
    validated.push({ slug, name: found.name, price: found.price, qty, notes });
  }

  const order = createOrder({ items: validated, tableNumber, contactName: body.contactName? String(body.contactName).slice(0,80): undefined, phone: body.phone? String(body.phone).slice(0,40): undefined, allergies: body.allergies? String(body.allergies).slice(0,280): undefined, servicePercent: settings.serviceChargePercent });

  try{
    await sendOrderSms(order); updateSmsStatus(order.orderId, "sent");
    return NextResponse.json({ ok:true, orderId: order.orderId, smsPending: false });
  }catch(e){
    console.error("Twilio SMS error:", e); updateSmsStatus(order.orderId, "failed");
    return NextResponse.json({ ok:true, orderId: order.orderId, smsPending: true });
  }
}
