import { describe, expect, it } from "vitest";
import { normKey, titleCase } from "./seed-properties";

describe("normKey", () => {
  it("normalizes postcode spacing and case", () => {
    expect(normKey("nw1 6xe", "Flat 1")).toBe(normKey("NW16XE", "Flat 1"));
  });

  it("strips punctuation from the address", () => {
    expect(normKey("NW1 6XE", "23 St. Bedes Crescent,")).toBe(normKey("NW1 6XE", "23 St Bedes Crescent"));
  });

  it("produces different keys for different addresses at the same postcode", () => {
    expect(normKey("NW1 6XE", "Flat 1")).not.toBe(normKey("NW1 6XE", "Flat 2"));
  });
});

describe("titleCase", () => {
  it("title-cases an all-caps town name", () => {
    expect(titleCase("CAMBRIDGE")).toBe("Cambridge");
  });

  it("title-cases each word", () => {
    expect(titleCase("SOUTH CAMBRIDGESHIRE")).toBe("South Cambridgeshire");
  });
});
