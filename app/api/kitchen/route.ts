import { NextRequest, NextResponse } from "next/server"; 
import { getSettings, saveSettings } from "@/lib/settings"; 
import { enforceSameOrigin } from "@/lib/cors";
export async function GET(){ return NextResponse.json(getSettings()); }
export async function POST(req: NextRequest){ const forbid = enforceSameOrigin(req); if(forbid) return forbid; const body = await req.json();
  const cur=getSettings(); const updated = { kitchenOpen: typeof body.kitchenOpen==="boolean"? body.kitchenOpen: cur.kitchenOpen,
    serviceChargePercent: typeof body.serviceChargePercent==="number"? body.serviceChargePercent: cur.serviceChargePercent };
  saveSettings(updated); return NextResponse.json(updated);
}
