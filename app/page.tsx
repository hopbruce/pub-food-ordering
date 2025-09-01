// app/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = false;

import menu from "@/data/menu.json";
import PageClient from "./pageClient";

export default function Page() {
  return <PageClient menu={menu as any} />;
}
