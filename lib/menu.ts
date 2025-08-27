import fs from "node:fs"; import path from "node:path";
import { slugify } from "./slug"; import type { MenuData, MenuCategory, MenuItem } from "./types";
const dataPath = path.join(process.cwd(),"data","menu.json");
export function loadMenu(): MenuData {
  const raw = JSON.parse(fs.readFileSync(dataPath,"utf-8"));
  const categories: MenuCategory[] = raw.categories.map((c:any)=>{
    const cslug = slugify(c.name);
    const items: MenuItem[] = c.items.map((it:any)=>({
      slug: slugify(it.name), name: it.name, description: it.description || undefined,
      price: typeof it.price==="number"? it.price: 0, tags: it.tags, optionsNote: it.optionsNote,
    }));
    return { slug: cslug, name: c.name, items };
  });
  return { categories };
}
export function findItem(slug: string): MenuItem | undefined {
  const menu = loadMenu();
  for (const cat of menu.categories) { const item = cat.items.find(i=>i.slug===slug); if (item) return item; }
  return undefined;
}
