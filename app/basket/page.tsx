// app/basket/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;

import NextDynamic from "next/dynamic";

const BasketClient = NextDynamic(() => import("./BasketClient"), { ssr: false });

export default function BasketPage() {
  return <BasketClient />;
}
