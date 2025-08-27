"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [settings, setSettings] = useState<{kitchenOpen:boolean; serviceChargePercent:number}>({kitchenOpen:true, serviceChargePercent:10});
  const [orders, setOrders] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    const s = await fetch("/api/kitchen").then(r=>r.json());
    setSettings(s);
    const o = await fetch("/api/orders/recent").then(r=>r.json());
    setOrders(o);
  }
  useEffect(()=>{ load(); },[]);

  async function save() {
    setSaving(true);
    try {
      const s = await fetch("/api/kitchen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings)}).then(r=>r.json());
      setSettings(s);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="card space-y-3">
        <div className="font-semibold">Kitchen</div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={settings.kitchenOpen} onChange={e=>setSettings({...settings, kitchenOpen: e.target.checked})}/>
          <span>Kitchen Open</span>
        </label>
        <label>
          <div>Service charge percent</div>
          <input type="number" min={0} max={50} value={settings.serviceChargePercent} onChange={e=>setSettings({...settings, serviceChargePercent: Number(e.target.value)||0})} className="w-32"/>
        </label>
        <button className="btn btn-primary w-fit" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</button>
      </div>
      <div className="card">
        <div className="font-semibold mb-2">Recent Orders</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left opacity-60">
              <tr><th>Time</th><th>ID</th><th>Table</th><th>Items</th><th>Total</th><th>SMS</th></tr>
            </thead>
            <tbody>
              {orders.map(o=>(
                <tr key={o.orderId} className="border-t border-neutral-800">
                  <td>{o.placedAt}</td>
                  <td>{o.orderId}</td>
                  <td>{o.tableNumber}</td>
                  <td>{o.items.map((i:any)=>`${i.qty}x ${i.name}`).join(", ")}</td>
                  <td>£{o.total.toFixed(2)}</td>
                  <td>{o.smsStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
