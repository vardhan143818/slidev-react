import type { ComponentType, ReactNode } from "react";
import type { LayoutName } from "@/slides/model/layout";

export type LayoutComponent = ComponentType<{ children: ReactNode }>;

export type LayoutRegistry = Partial<Record<LayoutName, LayoutComponent>>;
