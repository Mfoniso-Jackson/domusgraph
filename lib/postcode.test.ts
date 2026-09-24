import { describe, expect, it } from "vitest";
import { normalizeUkPostcode } from "./postcode";

describe("normalizeUkPostcode", () => {
  it("uppercases and inserts a single space before the inward code", () => {
    expect(normalizeUkPostcode("nw16xe")).toBe("NW1 6XE");
  });

  it("collapses extra whitespace", () => {
    expect(normalizeUkPostcode("  NW1    6XE  ")).toBe("NW1 6XE");
  });

  it("leaves an already-correct postcode unchanged", () => {
    expect(normalizeUkPostcode("SW1A 1AA")).toBe("SW1A 1AA");
  });

  it("handles single-letter, single-digit outward codes", () => {
    expect(normalizeUkPostcode("m11ae")).toBe("M1 1AE");
  });

  it("returns null for something that isn't a UK postcode", () => {
    expect(normalizeUkPostcode("not a postcode")).toBeNull();
    expect(normalizeUkPostcode("12345")).toBeNull();
  });
});
