const buckets = new Map<string,{count:number;reset:number}>();
export function rateLimit(ip:string, limit=20, windowMs=60_000){ const now=Date.now(); const b=buckets.get(ip);
  if(!b||b.reset<now){ buckets.set(ip,{count:1,reset:now+windowMs}); return true; }
  if(b.count>=limit) return false; b.count+=1; return true;
}
