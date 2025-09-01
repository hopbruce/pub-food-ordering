// lib/orders.ts
import fs from "fs";
import path from "path";

export type OrderItem = {
  slug: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
};

export type Order = {
  orderId: string;
  tableNumber: string;
  items: OrderItem[];
  subtotal: number;
  service: number;
  total: number;
  allergies?: string;
  placedAt: string; // ISO
  smsStatus?: "sent" | "pending" | "error";
};

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_PATH = path.join(DATA_DIR, "orders.json");

let mem: Order[] = [];

function ensureFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(ORDERS_PATH)) fs.writeFileSync(ORDERS_PATH, "[]");
  } catch {
    // read-only env — fine, memory fallback only
  }
}

function readAll(): Order[] {
  ensureFile();
  try {
    mem = JSON.parse(fs.readFileSync(ORDERS_PATH, "utf8")) as Order[];
  } catch {}
  return mem;
}

function writeAll(list: Order[]) {
  mem = list;
  try {
    ensureFile();
    fs.writeFileSync(ORDERS_PATH, JSON.stringify(list, null, 2));
  } catch {}
}

export function addOrder(o: Order) {
  const all = readAll();
  all.unshift(o);
  writeAll(all);
}

export function readOrders(): Order[] {
  return readAll();
}

export function getRecentOrders(limit = 20): Order[] {
  return readAll().slice(0, limit);
}
