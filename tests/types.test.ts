import { describe, expect, it } from "vitest";
import { Mandate } from "@/lib/types";

describe("Mandate schema", () => {
  const base = {
    id: "m_1",
    userPrompt: "Buy me noise-canceling headphones under $150, no subscriptions.",
    maxTotal: { value: "150.00", currency: "USD" },
    allowedCategories: ["electronics/headphones"],
    maxQuantity: 1,
    allowRecurring: false,
    expiresAt: new Date(Date.now() + 2 * 3600_000).toISOString(),
    status: "DRAFT",
    createdAt: new Date().toISOString(),
  };

  it("accepts a valid draft", () => {
    expect(Mandate.safeParse(base).success).toBe(true);
  });

  it("rejects recurring charges", () => {
    expect(Mandate.safeParse({ ...base, allowRecurring: true }).success).toBe(false);
  });

  it("rejects malformed amounts", () => {
    expect(Mandate.safeParse({ ...base, maxTotal: { value: "lots", currency: "USD" } }).success).toBe(false);
  });
});
