"use client";
import { useEffect, useMemo, useState } from "react";
import type { MenuData, MenuItem } from "@/lib/types";
import { useCart } from "@/components/cart/CartContext";
import { useToaster } from "@/components/Toaster";
import clsx from "clsx";

export default function MenuClient({ menu }: { menu: MenuData }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string>("all");
  const [active, setActive] = useState(menu.categories[0]?.slug ?? "");
  const { addItem } = useCart();
  const toast = useToaster();
  const filtered = useMemo(() => {
    const lc = query.toLowerCase().trim();
    return menu.categories.map((c) => ({
      ...c,
      items: c.items.filter((i) => {
        const okTag = tag === "all" || (i.tags || []).includes(tag as any);
        const okQ = !lc || i.name.toLowerCase().includes(lc) || (i.description||"").toLowerCase().includes(lc);
        return okTag && okQ;
      }),
    }));
  }, [menu, query, tag]);

  const [kitchenOpen, setKitchenOpen] = useState(true);
  useEffect(() => {
    fetch("/api/kitchen").then(r=>r.json()).then(s=>setKitchenOpen(!!s.kitchenOpen)).catch(()=>{});
  }, []);

  return (
    <div className="space-y-4">
      {!kitchenOpen && (
        <div className="card border-red-700">
          <span className="text-red-400 font-semibold">Kitchen closed.</span> Checkout is disabled.
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input
          aria-label="Search menu"
          placeholder="Search…"
          value={query}
          onChange={(e)=>setQuery(e.target.value)}
          className="w-64"
        />
        <select aria-label="Filter tag" value={tag} onChange={(e)=>setTag(e.target.value)} className="w-40">
          <option value="all">All items</option>
          <option value="vg">Vegan</option>
          <option value="veg">Vegetarian</option>
          <option value="pesc">Pescatarian</option>
          <option value="vg-option">Vegan option</option>
        </select>
      </div>

      <div role="tablist" aria-label="Categories" className="flex gap-2 overflow-x-auto pb-2">
        {filtered.map((c)=>(
          <button
            key={c.slug}
            role="tab"
            aria-selected={active===c.slug}
            onClick={()=>setActive(c.slug)}
            className={clsx("badge", active===c.slug && "bg-pubaccent text-black border-pubaccent")}
          >
            {c.name}
          </button>
        ))}
      </div>

      {filtered.map((c)=>(
        <section key={c.slug} aria-labelledby={`h-${c.slug}`} hidden={active!==c.slug}>
          <h2 id={`h-${c.slug}`} className="sr-only">{c.name}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {c.items.map((i)=>(<MenuCard key={i.slug} item={i} onAdd={()=>{addItem(i,1); toast.push(`Added ${i.name}`);}} />))}
            {c.items.length===0 && <div className="opacity-60">No matches.</div>}
          </div>
        </section>
      ))}
    </div>
  );
}

function MenuCard({ item, onAdd }: { item: MenuItem; onAdd: ()=>void }) {
  const [show, setShow] = useState(false);
  return (
    <article className="card">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{item.name}</h3>
          {item.tags && (
            <div className="mt-1 flex gap-2">
              {item.tags.map(t=>(<span key={t} className="badge">{t}</span>))}
            </div>
          )}
          {show && item.description && <p className="mt-2 text-sm opacity-90">{item.description}</p>}
          {item.optionsNote && <p className="mt-2 text-xs opacity-70">{item.optionsNote}</p>}
        </div>
        <div className="text-right">
          <div className="text-xl font-semibold">£{item.price.toFixed(2)}</div>
          <div className="text-xs opacity-60">incl. VAT</div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="btn btn-primary" onClick={onAdd} aria-label={`Add ${item.name}`}>
          + Add
        </button>
        <button className="btn border border-neutral-700" onClick={()=>setShow(s=>!s)} aria-expanded={show}>
          {show ? "Less" : "More"}
        </button>
      </div>
    </article>
  );
}
