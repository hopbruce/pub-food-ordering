"use client";

import React, { useMemo, useState } from "react";
import clsx from "clsx";
import { useCart } from "@/components/cart/CartContext";
import type { MenuData, MenuItem } from "@/lib/types";

type Props = { menu: MenuData };

export default function PageClient({ menu }: Props) {
  const { add } = useCart();
  const categories = menu?.categories ?? [];

  const [activeCat, setActiveCat] = useState(0);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<"all" | "veg" | "vg" | "pesc">("all");

  const items = useMemo(() => {
    const cat = categories[activeCat];
    if (!cat) return [];
    const q = query.trim().toLowerCase();

    return (cat.items ?? []).filter((it) => {
      const matchesQuery =
        !q ||
        it.name.toLowerCase().includes(q) ||
        (it.description ?? "").toLowerCase().includes(q);

      const matchesTag =
        tag === "all" ||
        (it.tags ?? []).some((t) => (t || "").toLowerCase().includes(tag));

      return matchesQuery && matchesTag;
    });
  }, [categories, activeCat, query, tag]);

  const handleAdd = (item: MenuItem) => {
    if (typeof item.price !== "number" || item.price <= 0) return;
    add({ slug: item.slug, name: item.name, price: item.price, qty: 1 } as any);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 pb-24">
      {/* Category tabs (blue/white) */}
      <nav className="flex flex-wrap gap-3 pt-4" aria-label="Categories">
        {categories.map((c, idx) => (
          <button
            key={c.name}
            onClick={() => setActiveCat(idx)}
            className={clsx(
              "px-4 py-2 rounded-full border transition",
              idx === activeCat
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-900 border-slate-300 hover:border-blue-400"
            )}
            aria-current={idx === activeCat ? "page" : undefined}
          >
            {c.name}
          </button>
        ))}
      </nav>

      {/* Search + tag filter */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search menu…"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          aria-label="Search menu"
        />

        <select
          value={tag}
          onChange={(e) => setTag(e.target.value as typeof tag)}
          className="w-full sm:w-48 rounded-md border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          aria-label="Filter by tag"
        >
          <option value="all">All</option>
          <option value="veg">Vegetarian</option>
          <option value="vg">Vegan</option>
          <option value="pesc">Pescatarian</option>
        </select>
      </div>

      {/* Heading */}
      <h2 className="mt-6 text-2xl font-semibold text-slate-900">
        {categories[activeCat]?.name ?? "Menu"}
      </h2>

      {/* Items */}
      <section
        className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-2"
        aria-label="Menu items"
      >
        {items.map((item) => (
          <article
            key={item.slug ?? item.name}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                {item.name}
              </h3>
              {typeof item.price === "number" && item.price > 0 ? (
                <span className="inline-block rounded-md bg-blue-100 px-2.5 py-1 text-sm font-semibold text-blue-700">
                  £{item.price.toFixed(2)}
                </span>
              ) : (
                <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-sm text-slate-600">
                  See options
                </span>
              )}
            </div>

            {item.description && (
              <p className="mt-2 text-slate-700 leading-relaxed">
                {item.description}
              </p>
            )}
            {item.optionsNote && (
              <p className="mt-2 text-sm text-slate-500">
                {item.optionsNote}
              </p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                {(item.tags ?? []).length > 0 && (
                  <span>Tags: {(item.tags ?? []).join(", ")}</span>
                )}
              </div>

              <button
                onClick={() => handleAdd(item)}
                disabled={!(typeof item.price === "number" && item.price > 0)}
                className={clsx(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  typeof item.price === "number" && item.price > 0
                    ? "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
                )}
              >
                + Add
              </button>
            </div>
          </article>
        ))}

        {items.length === 0 && (
          <div className="col-span-full rounded-lg border border-slate-200 bg-white p-6 text-slate-600">
            No items match your search/filter in this category.
          </div>
        )}
      </section>
    </main>
  );
}
