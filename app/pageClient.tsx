// app/pageClient.tsx
"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/components/cart/CartContext";
import { slugify } from "@/lib/menu";

type MenuData = {
  categories: {
    name: string;
    items: {
      name: string;
      description?: string;
      price: number;
      optionsNote?: string;
      tags?: string[];
      slug?: string;
    }[];
  }[];
};

function money(n: number) {
  return `£${(Math.round(n * 100) / 100).toFixed(2)}`;
}

export default function PageClient({ menu }: { menu: MenuData }) {
  const { add } = useCart();
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<"" | "vg" | "veg" | "pesc">("");
  const [cat, setCat] = useState<string>(menu.categories?.[0]?.name || "");
  const [toast, setToast] = useState<string>("");

  const normalized = useMemo(() => {
    return (menu.categories || []).map((c) => ({
      ...c,
      items: c.items.map((i) => ({ ...i, slug: i.slug || slugify(i.name) })),
    }));
  }, [menu]);

  const categories = normalized.map((c) => c.name);

  const visibleItems = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out: { cat: string; items: MenuData["categories"][number]["items"] }[] = [];
    for (const c of normalized) {
      if (c.name !== cat) continue;
      let items = c.items;
      if (needle) {
        items = items.filter(
          (i) =>
            i.name.toLowerCase().includes(needle) ||
            (i.description || "").toLowerCase().includes(needle)
        );
      }
      if (tag) items = items.filter((i) => (i.tags || []).includes(tag));
      out.push({ cat: c.name, items });
    }
    return out;
  }, [normalized, q, tag, cat]);

  function handleAdd(i: any) {
    add({ slug: i.slug!, qty: 1, name: i.name, price: i.price });
    setToast(`Added: ${i.name}`);
    setTimeout(() => setToast(""), 900);
  }

  return (
    <main className="max-w-6xl mx-auto p-4">
      {/* brand */}
      <div className="mb-4 flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-amber-500" />
        <div className="text-white font-semibold text-lg">The Pub</div>
      </div>

      {/* tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-3 py-2 rounded-full border ${
              cat === c ? "bg-amber-600 border-amber-500 text-black" : "bg-neutral-900 border-neutral-800 text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* search + filter */}
      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-white"
          placeholder="Search menu…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="w-40 rounded-md bg-neutral-900 border border-neutral-800 px-3 py-2 text-white"
          value={tag}
          onChange={(e) => setTag(e.target.value as any)}
        >
          <option value="">All</option>
          <option value="vg">Vegan</option>
          <option value="veg">Vegetarian</option>
          <option value="pesc">Pescatarian</option>
        </select>
      </div>

      {/* list for selected category */}
      {visibleItems.map(({ cat, items }) => (
        <section key={cat} className="mt-5">
          <h2 className="text-xl text-white font-semibold mb-3">{cat}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((i) => (
              <div
                key={i.slug}
                className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="text-white font-medium">{i.name}</div>
                  {i.description ? (
                    <div className="text-sm text-neutral-400 mt-1">{i.description}</div>
                  ) : null}
                  {i.optionsNote ? (
                    <div className="text-xs text-neutral-500 mt-1">{i.optionsNote}</div>
                  ) : null}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-block rounded-md bg-amber-600 text-black px-2 py-1 text-sm">
                    {money(i.price || 0)}
                  </span>
                  <button
                    onClick={() => handleAdd(i)}
                    className="rounded-md bg-white text-black px-3 py-2 hover:bg-neutral-200"
                    aria-label={`Add ${i.name}`}
                  >
                    + Add
                  </button>
                </div>
                {i.tags?.length ? (
                  <div className="mt-2 text-xs text-neutral-400">Tags: {i.tags.join(", ")}</div>
                ) : null}
              </div>
            ))}
            {items.length === 0 && (
              <div className="text-neutral-400">No items match your filter.</div>
            )}
          </div>
        </section>
      ))}

      {/* tiny toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-white text-black px-3 py-2 rounded-md shadow">
          {toast}
        </div>
      )}
    </main>
  );
}
