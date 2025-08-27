import fs from "node:fs"; import path from "node:path"; import { v4 as uuidv4 } from "uuid";
import type { Order, CartLine } from "./types";
const ordersPath = path.join(process.cwd(),"data","orders.json");
export function readOrders(): Order[] { try { return JSON.parse(fs.readFileSync(ordersPath,"utf-8")); } catch { return []; } }
export function writeOrders(orders: Order[]){ fs.writeFileSync(ordersPath, JSON.stringify(orders,null,2)); }
export function createOrder(payload:{ items: CartLine[]; tableNumber: string; contactName?: string; phone?: string; allergies?: string; servicePercent: number; }): Order {
  const subtotal = payload.items.reduce((sum,it)=>sum + it.price*it.qty, 0);
  const service = Math.round(subtotal * payload.servicePercent) / 100;
  const total = subtotal + service;
  const orderId = uuidv4().split("-")[0].toUpperCase();
  const placedAt = new Date().toISOString();
  const order: Order = {
    orderId, items: payload.items, subtotal: round2(subtotal), service: round2(service), total: round2(total),
    tableNumber: payload.tableNumber, contactName: payload.contactName, phone: payload.phone, allergies: payload.allergies,
    placedAt, smsStatus: "pending"
  };
  const orders = readOrders(); orders.unshift(order); writeOrders(orders); return order;
}
export function updateSmsStatus(orderId: string, status: Order["smsStatus"]){
  const orders = readOrders(); const idx = orders.findIndex(o=>o.orderId===orderId);
  if (idx>=0){ orders[idx].smsStatus = status; writeOrders(orders); }
}
function round2(n:number){ return Math.round(n*100)/100; }
