import type { ReactNode } from "react";

export function ImmersiveLayout({ children }: { children: ReactNode }) {
  return <section className="slide-layout-immersive relative size-full overflow-hidden">{children}</section>;
}
