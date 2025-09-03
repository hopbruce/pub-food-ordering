"use client";

import { useMemo, useState } from "react";
import type { MenuData, MenuItem } from "@/lib/types";
import { useCart } from "@/components/cart/CartContext";
import clsx from "clsx";

type Props = { menu: MenuData };

const TAG_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Vegetarian", value: "veg" },
  { label: "Vegan", value: "vg" },
  { label: "Pescatarian", value: "pesc" },
];

export default function PageClient({ menu }: Props) {
  const { add } = useCart();
  const [activeCat, setActiveCat] = useState(0);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState(TAG_OPTIONS[0].value);

  const categories = menu.categories ?? [];

  const filteredItems = useMemo(() => {
    const cat = categories[activeCat];
    if (!cat) return [];
    const q = query.trim().toLowerCase();

    return (cat.items ?? []).filter((item: MenuItem) => {
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q);

      const matchesTag =
        tag === "all" ||
        (item.tags ?? []).some((t) =>
          // normalize: "veg", "vg", "vg-option", "pesc"
          (t || "").toLowerCase().includes(tag)
        );

      return matchesQuery && matchesTag;
    });
  }, [categories, activeCat, query, tag]);

  function handleAdd(item: MenuItem) {
    // Minimal payload (your CartContext will normalize/stash in localStorage)
    add({
      slug: item.slug,
      name: item.name,
      price: item.price,
      qty: 1,
    } as any);
  }

  return (
    <main className="max-w-6xl mx-auto px-4 pb-24">
      {/* Removed the old “The Pub” lockup */}

      {/* Category tabs */}
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
        <label className="flex-1">
          <span className="sr-only">Search menu</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search menu…"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </label>

        <label className="w-full sm:w-48">
          <span className="sr-only">Filter by tag</span>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {TAG_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Category heading */}
      <h2 className="mt-6 text-2xl font-semibold text-slate-900">
        {categories[activeCat]?.name ?? "Menu"}
      </h2>

      {/* Items grid */}
      <section
        className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-2"
        aria-label="Menu items"
      >
        {filteredItems.map((item) => (
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

            {item.description ? (
              <p className="mt-2 text-slate-700 leading-relaxed">
                {item.description}
              </p>
            ) : null}

            {item.optionsNote ? (
              <p className="mt-2 text-sm text-slate-500">{item.optionsNote}</p>
            ) : null}

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
                    : "bg-slate-200 text-slate-500 cursor-not
