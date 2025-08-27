import fs from "node:fs"; import path from "node:path";
const settingsPath = path.join(process.cwd(),"data","settings.json");
export type Settings = { kitchenOpen: boolean; serviceChargePercent: number };
export function getSettings(): Settings {
  try {
    const raw = JSON.parse(fs.readFileSync(settingsPath,"utf-8"));
    return { kitchenOpen: !!raw.kitchenOpen, serviceChargePercent: Number(raw.serviceChargePercent)||0 };
  } catch {
    return { kitchenOpen: process.env.KITCHEN_OPEN !== "false", serviceChargePercent: Number(process.env.SERVICE_CHARGE_PERCENT||0) };
  }
}
export function saveSettings(s: Settings){ fs.writeFileSync(settingsPath, JSON.stringify(s,null,2)); }
