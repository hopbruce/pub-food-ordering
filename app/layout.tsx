import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import dynamic from "next/dynamic";

const StickyBar = dynamic(() => import("@/components/cart/StickyBar"), { ssr: false });

export const metadata: Metadata = {
  title: "The Pub",
  description: "Pub food ordering",
};

export const dynamic = "force-dynamic";
export const revalidate = false;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-white min-h-screen">
        <Providers>
          {children}
          <StickyBar />
        </Providers>
      </body>
    </html>
  );
}
