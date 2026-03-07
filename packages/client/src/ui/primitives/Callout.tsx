import type { ReactNode } from "react";

const stylesByType = {
  info: "border-green-600/80 bg-green-50 text-green-950",
  warn: "border-amber-600/80 bg-amber-50 text-amber-950",
  success: "border-emerald-600/80 bg-emerald-50 text-emerald-950",
} as const;

export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: "info" | "warn" | "success";
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className={`my-4 rounded-xl border-l-4 px-3.5 py-3 ${stylesByType[type]}`}>
      {title ? <strong className="mb-1 block">{title}</strong> : null}
      <div>{children}</div>
    </aside>
  );
}
