import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "The Pub",
  description: "Pub food ordering",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
