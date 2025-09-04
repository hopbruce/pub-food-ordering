// app/receipt/[id]/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = false;

import { readOrders } from "@/lib/orders";

export default function ReceiptPage({ params }: { params: { id: string } }) {
  const orders = readOrders();
  const order = orders.find((o: any) => o.id === params.id);

  if (!order) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Receipt</h1>
        <p className="mt-3 text-slate-600">Order not found.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 bg-white">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">The Dovetail</h1>
          <p className="text-slate-600">Thanks! This is a demo receipt.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="rounded-md px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          Print
        </button>
      </header>

      <section className="mt-6 grid gap-1 text-sm text-slate-700">
        <div>
          <span className="font-medium">Order ID:</span> {order.id}
        </div>
        <div>
          <span className="font-medium">Placed:</span>{" "}
          {new Date(order.ts).toLocaleString()}
        </div>
        <div>
          <span className="font-medium">Table:</span> {order.table || "—"}
        </div>
        {order.name && (
          <div>
            <span className="font-medium">Name:</span> {order.name}
          </div>
        )}
        {order.phone && (
          <div>
            <span className="font-medium">Phone:</span> {order.phone}
          </div>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Items</h2>
        <div className="mt-3 rounded-lg border border-slate-200">
          {order.items.map((it: any, i: number) => (
            <div
              key={i}
              className="flex items-start justify-between gap-3 px-4 py-3 border-b last:border-b-0 border-slate-200"
            >
              <div>
                <div className="font-medium text-slate-900">
                  {it.qty} × {it.name}
                </div>
                {it.notes && (
                  <div className="text-sm text-slate-500">Notes: {it.notes}</div>
                )}
              </div>
              <div className="tabular-nums text-slate-900">
                £{(it.priceEach * it.qty).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 ml-auto w-full sm:w-80">
        <div className="flex justify-between text-slate-700">
          <span>Subtotal</span>
          <span className="tabular-nums">£{order.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-700">
          <span>Service ({order.servicePercent || 0}%)</span>
          <span className="tabular-nums">£{order.service.toFixed(2)}</span>
        </div>
        <div className="mt-2 h-px bg-slate-200" />
        <div className="mt-2 flex justify-between text-lg font-semibold text-slate-900">
          <span>Total</span>
          <span className="tabular-nums">£{order.total.toFixed(2)}</span>
        </div>
        {order.notes && (
          <div className="mt-3 text-sm text-slate-600">
            <span className="font-medium">Allergies/Notes:</span> {order.notes}
          </div>
        )}
      </section>

      <footer className="mt-10 flex flex-wrap gap-3">
        <a
          href="/"
          className="rounded-md px-4 py-2 border border-slate-300 text-slate-700 hover:border-blue-400"
        >
          Back to menu
        </a>
        <span className="text-sm text-slate-500 self-center">
          Status: <strong>{order.status}</strong> (demo)
        </span>
      </footer>
    </main>
  );
}
