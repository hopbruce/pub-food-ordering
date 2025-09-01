// app/basket/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = false;

import BasketClient from "./BasketClient";

export default function BasketPage() {
  return <BasketClient />;
}
