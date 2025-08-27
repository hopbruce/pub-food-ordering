export type MenuTag = "vg" | "veg" | "pesc" | "vg-option";
export type MenuItem = { slug: string; name: string; description?: string; price: number; tags?: MenuTag[]; optionsNote?: string; };
export type MenuCategory = { slug: string; name: string; items: MenuItem[]; };
export type MenuData = { categories: MenuCategory[] };
export type CartLine = { slug: string; name: string; price: number; qty: number; notes?: string; };
export type Order = {
  orderId: string; items: CartLine[]; subtotal: number; service: number; total: number;
  tableNumber: string; contactName?: string; phone?: string; allergies?: string;
  placedAt: string; smsStatus: "sent" | "pending" | "failed";
};
