// lib/menu.ts
import raw from "@/data/menu.json";

export type MenuItem = {
  name: string;
  description?: string;
  price: number;
  tags?: string[];
  optionsNote?: string;
  slug: string;
};

export type MenuCategory = {
  name: string;
  items: MenuItem[];
};

export type MenuData = {
  categories: MenuCategory[];
};

// simple slugify
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const normalized: MenuData = {
  categories: (raw as MenuData).categories.map((cat) => ({
    ...cat,
    items: cat.items.map((i) => ({
      ...i,
      slug: i.slug ?? slugify(i.name),
    })),
  })),
};

export function getMenu(): MenuData {
  return normalized;
}

export function findItem(slug: string): MenuItem | undefined {
  for (const c of normalized.categories) {
    const found = c.items.find((i) => i.slug === slug);
    if (found) return found;
  }
  return undefined;
}
