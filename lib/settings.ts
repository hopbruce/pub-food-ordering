// lib/settings.ts
import fs from "fs";
import path from "path";

export type Settings = {
  kitchenOpen: boolean;
  serviceChargePercent: number; // 0..1
};

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "settings.json");

const DEFAULTS: Settings = {
  kitchenOpen: process.env.KITCHEN_OPEN
    ? process.env.KITCHEN_OPEN === "true"
    : true,
  serviceChargePercent:
    Number(process.env.SERVICE_CHARGE_PERCENT || 0) || 0,
};

function ensureDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {}
}

export function getSettings(): Settings {
  try {
    const txt = fs.readFileSync(FILE, "utf8");
    const parsed = JSON.parse(txt);
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(partial: Partial<Settings>) {
  const merged = { ...getSettings(), ...partial };
  try {
    ensureDir();
    fs.writeFileSync(FILE, JSON.stringify(merged, null, 2));
  } catch {
    // read-only env (e.g. free Render) — ok, just keep in memory for this process
  }
  return merged;
}
