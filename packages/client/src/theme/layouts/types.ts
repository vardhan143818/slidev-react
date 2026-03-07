import type { ComponentType, ReactNode } from "react";
import type { LayoutName } from "@slidev-react/node/slides/model/layout";

export type LayoutComponent = ComponentType<{ children: ReactNode }>;

export type LayoutRegistry = Partial<Record<LayoutName, LayoutComponent>>;
