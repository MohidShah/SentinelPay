import { createHash } from "node:crypto";

/**
 * Deterministic JSON: object keys sorted recursively, `undefined` dropped,
 * no whitespace. Two semantically equal objects always produce the same bytes,
 * so a hash/signature over it is stable.
 */
export function canonicalize(value: unknown): string {
  return JSON.stringify(sortDeep(value));
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map((v) => (v === undefined ? null : sortDeep(v)));
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as object).sort()) {
      const v = (value as Record<string, unknown>)[key];
      if (v !== undefined) out[key] = sortDeep(v);
    }
    return out;
  }
  if (typeof value === "number" && !Number.isFinite(value)) {
    throw new Error("Cannot canonicalize non-finite number");
  }
  return value;
}

export function sha256Hex(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex");
}
