"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type Toast = { id: number; text: string };
const ToastCtx = createContext<{ push: (t: string) => void } | null>(null);

export function useToaster() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("No toaster");
  return ctx;
}

export default function Toaster({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  function push(text: string) {
    const id = Date.now();
    setItems((prev) => [...prev, { id, text }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 2000);
  }
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-50" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="card">{t.text}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
