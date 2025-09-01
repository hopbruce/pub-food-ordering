// simple CORS helper placeholder
// lib/cors.ts
import { NextRequest, NextResponse } from "next/server";

/** Return a 403 response if request Origin host doesn't match this Host */
export function enforceSameOrigin(req: NextRequest): NextResponse | null {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return null; // tolerate when no origin
  try {
    const o = new URL(origin);
    if (o.host !== host) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }
  } catch {
    // ignore bad origin
  }
  return null;
}
