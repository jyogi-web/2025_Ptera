/**
 * Utility helpers for expiry date handling used by server-side filtering.
 */
export function parseToDate(
  input: Date | string | undefined | null,
): Date | null {
  if (!input) return null;
  if (input instanceof Date) return input;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isExpired(
  input: Date | string | undefined | null,
  now: Date = new Date(),
): boolean {
  const d = parseToDate(input);
  if (!d) return false; // treat invalid/missing expiry as not expired (handled elsewhere)
  return d.getTime() <= now.getTime();
}

export function daysUntil(
  input: Date | string | undefined | null,
  now: Date = new Date(),
): number | null {
  const d = parseToDate(input);
  if (!d) return null;
  const diffMs = d.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export default { parseToDate, isExpired, daysUntil };
