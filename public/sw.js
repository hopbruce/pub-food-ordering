// offline fallback
const CACHE="pub-offline-v1", OFFLINE="/offline";
self.addEventListener("install",e=>{e.waitUntil((async()=>{const c=await caches.open(CACHE);await c.addAll([OFFLINE,"/","/manifest.json"]);self.skipWaiting();})())});
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{ if(e.request.mode==="navigate"){ e.respondWith((async()=>{ try{const p=await e.preloadResponse;if(p)return p; return await fetch(e.request);}catch{const c=await caches.open(CACHE);return (await c.match(OFFLINE))||new Response("Offline",{status:503});}})()); }});
