// lib/menu.ts
import menu from "../data/menu.json";

export type MenuData = typeof menu;

export type MenuItem = {
  name: string;
  description?: string;
  price: number;
  tags?: string[];
  optionsNote?: string;
  slug?: string;
};

export function getMenu(): MenuData {
  return menu as MenuData;
}

export function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function findItem(slug: string) {
  for (const cat of (menu as any).categories ?? []) {
    for (const item of cat.items ?? []) {
      const s = item.slug ?? slugify(item.name);
      if (s === slug) {
        return { ...item, slug: s } as MenuItem & { slug: string };
      }
    }
  }
  return null;
}
