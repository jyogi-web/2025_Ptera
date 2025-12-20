import { describe, it, expect } from "vitest";
import { isExpired, daysUntil } from "./expiry";

describe("expiry utilities", () => {
  it("returns true for past dates", () => {
    const now = new Date("2025-12-21T00:00:00.000Z");
    const past = new Date("2020-01-01T00:00:00.000Z");
    expect(isExpired(past, now)).toBe(true);
  });

  it("returns false for future dates", () => {
    const now = new Date("2025-12-21T00:00:00.000Z");
    const future = new Date("2026-01-01T00:00:00.000Z");
    expect(isExpired(future, now)).toBe(false);
  });

  it("calculates days until correctly for future date", () => {
    const now = new Date("2025-12-21T00:00:00.000Z");
    const future = new Date("2025-12-26T00:00:00.000Z");
    expect(daysUntil(future, now)).toBe(5);
  });

  it("returns 0 or negative for same-day or past dates", () => {
    const now = new Date("2025-12-21T12:00:00.000Z");
    const sameDay = new Date("2025-12-21T00:00:00.000Z");
    expect(daysUntil(sameDay, now)).toBeLessThanOrEqual(0);
  });
});
