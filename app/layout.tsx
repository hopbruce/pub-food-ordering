import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "The Pub — Ordering",
  description: "Order food at your table. Pay at bar.",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}`,
          }}
        />
        <header className="border-b border-neutral-800 sticky top-0 z-40 bg-neutral-950/80 backdrop-blur">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            <img src="/brand.svg" alt="" width={28} height={28} />
            <div className="font-semibold tracking-wide">The Pub</div>
            <div className="ml-auto text-sm opacity-70">Pay at bar</div>
          </div>
        </header>
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">{children}</main>
        <footer className="border-t border-neutral-800 py-4 text-center text-sm opacity-70">
          Allergy advice: Our kitchen handles nuts, gluten & other allergens.
        </footer>
      </body>
    </html>
  );
}
