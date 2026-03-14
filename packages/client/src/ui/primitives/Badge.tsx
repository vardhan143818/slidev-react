import type { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-emerald-500/16 bg-green-100 px-2 py-0.5 text-sm font-semibold leading-snug text-green-800">
      {children}
    </span>
  );
}
