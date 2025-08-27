import { readOrders } from "@/lib/orders";

export default function Ticket({ params }: any) {
  const order = readOrders().find(o=>o.orderId===params.id);
  if (!order) return <div>Not found</div>;
  return (
    <div className="p-8 text-black bg-white min-h-screen print:bg-white">
      <div className="max-w-xl mx-auto">
        <div className="text-3xl font-bold mb-4">THE PUB — KITCHEN TICKET</div>
        <div className="flex justify-between mb-2">
          <div><strong>Order</strong> #{order.orderId}</div>
          <div><strong>Table</strong> {order.tableNumber}</div>
        </div>
        <div className="mb-2"><strong>Placed</strong> {order.placedAt}</div>
        <hr className="my-4"/>
        <ul className="space-y-2 text-xl">
          {order.items.map((it)=>(
            <li key={it.slug} className="flex justify-between">
              <span>{it.qty} × {it.name} {it.notes ? `(notes: ${it.notes})` : ""}</span>
              <span>£{it.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <hr className="my-4"/>
        <div className="text-xl flex justify-between"><span>Subtotal</span><span>£{order.subtotal.toFixed(2)}</span></div>
        <div className="text-xl flex justify-between"><span>Service</span><span>£{order.service.toFixed(2)}</span></div>
        <div className="text-2xl font-bold flex justify-between"><span>Total</span><span>£{order.total.toFixed(2)}</span></div>
        <div className="mt-6"><strong>Allergies/Notes:</strong> {order.allergies || "None"}</div>
      </div>
      <style>{`@media print{ .no-print{ display:none } }`}</style>
      <div className="no-print mt-6"><button onClick={()=>window.print()} className="btn btn-primary">Print</button></div>
    </div>
  );
}
