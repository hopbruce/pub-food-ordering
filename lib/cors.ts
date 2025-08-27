import type { NextRequest } from "next/server";
export function enforceSameOrigin(req: NextRequest){
  const origin = req.headers.get("origin"); const host = req.headers.get("host");
  if(origin){ try{ const o=new URL(origin); if(o.host!==host){ return new Response("Forbidden",{status:403}); } }catch{}
  }
  return null;
}
