import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimitState } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetRateLimitState();
  });

  it("allows requests up to the max", () => {
    for (let i = 0; i < 3; i++) {
      expect(() => checkRateLimit("test-action:1.2.3.4", { max: 3 })).not.toThrow();
    }
  });

  it("throws once the max is exceeded", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("test-action:1.2.3.4", { max: 3 });
    expect(() => checkRateLimit("test-action:1.2.3.4", { max: 3 })).toThrow(/too many/i);
  });

  it("tracks separate keys independently", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("action-a:1.2.3.4", { max: 3 });
    expect(() => checkRateLimit("action-b:1.2.3.4", { max: 3 })).not.toThrow();
  });

  it("resets the bucket once the window has passed", () => {
    const start = 1_000_000;
    for (let i = 0; i < 3; i++) checkRateLimit("test-action:1.2.3.4", { max: 3, windowMs: 1000 }, start);
    expect(() => checkRateLimit("test-action:1.2.3.4", { max: 3, windowMs: 1000 }, start + 500)).toThrow();
    expect(() => checkRateLimit("test-action:1.2.3.4", { max: 3, windowMs: 1000 }, start + 1001)).not.toThrow();
  });
});
