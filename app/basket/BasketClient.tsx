"use client";
// rehydrate in case of full reload before context loads
useEffect(() => {
  if (items.length === 0) {
    try {
      const raw = localStorage.getItem("cart");
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed) && parsed.length) {
        // Add each item back into context
        parsed.forEach((i: any) => {
          // call once per item (idempotent thanks to add() merge)
          // @ts-ignore
          if (typeof cart?.add === "function") cart.add(i);
        });
      }
    } catch {}
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
