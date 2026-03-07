import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

const toneClassNames = {
  glass:
    "border border-slate-200/70 bg-white/72 text-slate-900 shadow-[0_18px_44px_rgba(148,163,184,0.18)] backdrop-blur-md",
  solid:
    "border border-slate-200/80 bg-white/92 text-slate-900 shadow-[0_18px_40px_rgba(148,163,184,0.16)]",
  inset: "border border-slate-200/80 bg-slate-50/78 text-slate-600",
  frame: "border border-slate-200/80 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
  dashed: "border border-dashed border-slate-200/80 bg-slate-50/75 text-slate-500",
} as const;

const radiusClassNames = {
  panel: "rounded-[8px]",
  section: "rounded-2xl",
  inset: "rounded-[6px]",
  frame: "rounded-[5px]",
} as const;

const paddingClassNames = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
} as const;

export function chromePanelClassName({
  className,
  tone = "glass",
  radius = "panel",
  padding = "md",
}: {
  className?: string;
  tone?: keyof typeof toneClassNames;
  radius?: keyof typeof radiusClassNames;
  padding?: keyof typeof paddingClassNames;
}) {
  return joinClassNames(
    "min-h-0 min-w-0",
    toneClassNames[tone],
    radiusClassNames[radius],
    paddingClassNames[padding],
    className,
  );
}

type ChromePanelProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  className?: string;
  tone?: keyof typeof toneClassNames;
  radius?: keyof typeof radiusClassNames;
  padding?: keyof typeof paddingClassNames;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function ChromePanel<T extends ElementType = "section">({
  as,
  children,
  className,
  tone = "glass",
  radius = "panel",
  padding = "md",
  ...props
}: ChromePanelProps<T>) {
  const Component = as ?? "section";

  return (
    <Component
      {...props}
      className={chromePanelClassName({ className, tone, radius, padding })}
    >
      {children}
    </Component>
  );
}
