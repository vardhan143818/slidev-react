import YAML from "yaml";
import { z } from "zod";

export interface FrontmatterResult {
  data: Record<string, unknown>;
  content: string;
}

const OPEN = "---";
const frontmatterDataSchema = z.object({}).catchall(z.unknown());

export function parseFrontmatter(source: string): FrontmatterResult {
  const normalized = source.replace(/\r\n/g, "\n");

  if (!normalized.startsWith(`${OPEN}\n`)) {
    return {
      data: {},
      content: normalized,
    };
  }

  const closeMarkerWithNewline = `\n${OPEN}\n`;
  const closeMarkerAtEnd = `\n${OPEN}`;
  const withNewlineIndex = normalized.indexOf(closeMarkerWithNewline, OPEN.length + 1);
  const atEndIndex =
    withNewlineIndex < 0 && normalized.endsWith(closeMarkerAtEnd)
      ? normalized.length - closeMarkerAtEnd.length
      : -1;
  const endIndex = withNewlineIndex >= 0 ? withNewlineIndex : atEndIndex;

  if (endIndex < 0) {
    throw new Error("Invalid frontmatter: missing closing ---");
  }

  const yamlSource = normalized.slice(OPEN.length + 1, endIndex);
  const raw = YAML.parse(yamlSource);
  const parsed = frontmatterDataSchema.safeParse(raw ?? {});
  if (!parsed.success) throw new Error("Invalid frontmatter: expected an object");

  const contentStart =
    endIndex + (withNewlineIndex >= 0 ? closeMarkerWithNewline.length : closeMarkerAtEnd.length);

  return {
    data: parsed.data,
    content: normalized.slice(contentStart),
  };
}
