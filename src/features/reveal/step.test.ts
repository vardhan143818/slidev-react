import { describe, expect, it } from "vitest";
import { normalizeRevealStep } from "./step";

describe("reveal step", () => {
  it("keeps undefined as undefined for always-visible consumers", () => {
    expect(normalizeRevealStep(undefined)).toBeUndefined();
  });

  it("normalizes invalid and fractional steps into positive integers", () => {
    expect(normalizeRevealStep(Number.NaN)).toBe(1);
    expect(normalizeRevealStep(-2)).toBe(1);
    expect(normalizeRevealStep(2.9)).toBe(2);
  });
});
