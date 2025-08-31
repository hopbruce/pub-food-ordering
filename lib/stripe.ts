// lib/stripe.ts
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("STRIPE_SECRET_KEY missing — payments will not work.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-06-20",
});

export const STRIPE_CURRENCY = (process.env.STRIPE_CURRENCY || "gbp") as
  | "gbp"
  | "eur"
  | "usd"
  | string;
