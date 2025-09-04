// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartContext";

export const metadata: Metadata = {
  title: "The Dovetail — Ordering",
  description: "Table ordering",
};

export const dynamic = "force-dynamic";
export const revalidate = false;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
