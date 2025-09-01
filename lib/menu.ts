// lib/menu.ts
import menu from "../data/menu.json";

export type MenuData = typeof menu;

export function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function getMenu(): MenuData {
  return menu as MenuData;
}

export function loadMenu(): MenuData {
  return getMenu();
}

export function findItem(slug: string) {
  for (const cat of (menu as any).categories ?? []) {
    for (const item of cat.items ?? []) {
      const s = (item.slug as string) || slugify(item.name);
      if (s === slug) return { ...item, slug: s };
    }
  }
  return null;
}
