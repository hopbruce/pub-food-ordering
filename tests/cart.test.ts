import { describe, it, expect } from "vitest";
import { addToCart, updateQty, removeFromCart, totals } from "../lib/cart";

const item = { slug: "fries", name: "Pint of Fries", price: 6 };

describe("cart logic", () => {
  it("adds items", () => {
    const cart = addToCart([], item as any, 2);
    expect(cart[0].qty).toBe(2);
  });
  it("updates qty", () => {
    let cart = addToCart([], item as any, 1);
    cart = updateQty(cart, "fries", 3);
    expect(cart[0].qty).toBe(3);
  });
  it("removes", () => {
    let cart = addToCart([], item as any, 1);
    cart = removeFromCart(cart, "fries");
    expect(cart.length).toBe(0);
  });
  it("totals", () => {
    let cart = addToCart([], item as any, 2);
    const t = totals(cart);
    expect(t.subtotal).toBe(12);
    expect(t.count).toBe(2);
  });
});
