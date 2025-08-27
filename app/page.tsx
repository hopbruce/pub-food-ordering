import Link from "next/link";
import { loadMenu } from "@/lib/menu";
import Toaster from "@/components/Toaster";
import StickyBar from "@/components/StickyBar";
import { CartProvider } from "@/components/cart/CartContext";
import MenuClient from "./pageClient";

export const revalidate = 0;

export default function Page() {
  const menu = loadMenu();
  return (
    <CartProvider>
      <Toaster>
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Menu</h1>
          <div className="ml-auto">
            <Link href="/admin" className="text-xs opacity-60 hover:opacity-100">
              /admin
            </Link>
          </div>
        </div>
        <MenuClient menu={menu} />
        <StickyBar />
      </Toaster>
    </CartProvider>
  );
}
