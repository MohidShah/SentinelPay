/** Money math in integer cents. Never use floats for totals. */

const MONEY_RE = /^\d+(\.\d{1,2})?$/;

export function toCents(value: string | number): number {
  const s = typeof value === "number" ? value.toFixed(2) : value.trim();
  if (!MONEY_RE.test(s)) throw new Error(`Invalid money amount: ${String(value)}`);
  const [whole, frac = ""] = s.split(".");
  return Number(whole) * 100 + Number(frac.padEnd(2, "0"));
}

export function fromCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

/** Like toCents, but returns null instead of throwing (for untrusted input). */
export function tryCents(value: string | number | undefined): number | null {
  if (value === undefined) return null;
  try {
    return toCents(value);
  } catch {
    return null;
  }
}
