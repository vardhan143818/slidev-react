import type { ComponentType, ReactNode } from "react";
import type { LayoutName } from "../slides/layout";

export type LayoutComponent = ComponentType<{ children: ReactNode }>;

export type LayoutRegistry = Partial<Record<LayoutName, LayoutComponent>>;

export type ThemeProviderComponent = ComponentType<{ children: ReactNode }>;

/**
 * MDX component overrides that a theme can provide.
 * Keys are component names (e.g. "Badge", "Callout"), values are React components.
 */
export type ThemeMDXComponents = Record<string, ComponentType<any>>;

export interface SlideThemeFontTokens {
  sans: string;
  serif: string;
  mono: string;
}

export interface SlideThemeUiTokens {
  background: string;
  surface: string;
  surfaceStrong: string;
  text: string;
  heading: string;
  muted: string;
  mutedSoft: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  border: string;
  borderStrong: string;
}

export interface SlideThemeFeedbackTokens {
  positive: string;
  negative: string;
  warning: string;
  info: string;
  neutral: string;
}

export interface SlideThemeChartTokens {
  accent: string;
  categorical: [string, string, string, string, string, string];
  positive: string;
  negative: string;
  warning: string;
  neutral: string;
  axis: string;
  grid: string;
}

export interface SlideThemeDiagramTokens {
  primary: string;
  primaryBorder: string;
  line: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  note: string;
  categorical: [string, string, string, string, string, string];
  accent: string;
}

export interface SlideThemeInsightTokens {
  border: string;
  background: string;
  title: string;
  text: string;
  shadow: string;
}

export interface SlideThemeAddonTokens {
  insight: SlideThemeInsightTokens;
}

export interface SlideThemeTokens {
  fonts: SlideThemeFontTokens;
  ui: SlideThemeUiTokens;
  feedback: SlideThemeFeedbackTokens;
  chart: SlideThemeChartTokens;
  diagram: SlideThemeDiagramTokens;
  addons: SlideThemeAddonTokens;
}

export interface SlideThemeDefinition {
  id: string;
  label: string;
  tokens: SlideThemeTokens;
  colorScheme?: "light" | "dark";
  rootAttributes?: Record<string, string>;
  rootClassName?: string;
  provider?: ThemeProviderComponent;
  layoutIds?: string[];
  layouts?: LayoutRegistry;
  mdxComponents?: ThemeMDXComponents;
}

export interface ResolvedSlideTheme {
  definition: SlideThemeDefinition;
  tokens: SlideThemeTokens;
  rootAttributes: Record<string, string>;
  rootClassName?: string;
  provider?: ThemeProviderComponent;
  layouts: LayoutRegistry;
  mdxComponents: ThemeMDXComponents;
}

export function defineTheme(theme: SlideThemeDefinition): SlideThemeDefinition {
  return theme;
}
