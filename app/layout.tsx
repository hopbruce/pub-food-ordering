import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import NextDynamic from "next/dynamic";
import Brand from "@/components/Brand";

const StickyBar = NextDynamic(() => import("@/components/cart/StickyBar"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "The Dovetail",
  description: "Pub food ordering",
};

export const dynamic = "force-dynamic";
export const revalidate = false;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Light theme base */}
      <body className="bg-white text-slate-900 min-h-screen">
        <Providers>
          <Brand />
          {children}
          <StickyBar />
        </Providers>
      </body>
    </html>
  );
}
