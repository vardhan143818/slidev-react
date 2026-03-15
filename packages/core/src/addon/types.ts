import type { ComponentType, ReactNode } from "react";
import type { LayoutRegistry, ThemeMDXComponents } from "../theme/types";

export type AddonProviderComponent = ComponentType<{ children: ReactNode }>;

export interface SlideAddonDefinition {
  id: string;
  label: string;
  experimental?: boolean;
  provider?: AddonProviderComponent;
  layoutIds?: string[];
  layouts?: LayoutRegistry;
  mdxComponents?: ThemeMDXComponents;
}

export interface ResolvedSlideAddons {
  definitions: SlideAddonDefinition[];
  providers: AddonProviderComponent[];
  layouts: LayoutRegistry;
  mdxComponents: ThemeMDXComponents;
}

export function defineAddon(addon: SlideAddonDefinition): SlideAddonDefinition {
  return addon;
}
