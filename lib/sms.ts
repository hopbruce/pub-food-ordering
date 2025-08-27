import twilio from "twilio"; import type { Order } from "./types";
export async function sendOrderSms(order: Order){
  const sid=process.env.TWILIO_ACCOUNT_SID, token=process.env.TWILIO_AUTH_TOKEN, from=process.env.TWILIO_FROM, to=process.env.ORDER_SMS_TO;
  if(!sid||!token||!from||!to){ throw new Error("Twilio env vars missing"); }
  const client = twilio(sid, token); const body = formatSms(order);
  await client.messages.create({ from, to, body });
}
export function formatSms(o: Order): string {
  const items = o.items.map(it=>`- ${it.qty} x ${it.name} (£${it.price.toFixed(2)})${it.notes? " "+it.notes: ""}`).join("\n");
  const allergy = o.allergies && o.allergies.trim()? o.allergies.trim(): "None";
  return `NEW PUB ORDER #${o.orderId}
Table: ${o.tableNumber}
Items:
${items}
Subtotal: £${o.subtotal.toFixed(2)}  Service: £${o.service.toFixed(2)}  Total: £${o.total.toFixed(2)}
Allergies/Notes: ${allergy}
Placed: ${o.placedAt}`;
}
