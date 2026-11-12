import { describe, expect, it } from "vitest";
import { extractCap, heuristicParse, noticesFor, requestsRecurring } from "@/lib/mandate/parser";

describe("subscription requests", () => {
  it("detects when the user asks for a recurring charge", () => {
    for (const p of [
      "Buy me 5 noise-canceling headphones under $150, rated well, with subscriptions.",
      "headphones plus a membership",
      "get earbuds and include the auto-renew warranty",
      "I want a subscription box under $40",
      "no ads, with a monthly plan",
    ]) {
      expect(requestsRecurring(p), p).toBe(true);
    }
  });

  it("does not flag requests that exclude recurring charges", () => {
    for (const p of [
      "Buy me noise-canceling headphones under $150, rated well, no subscriptions.",
      "earbuds under $80, no memberships",
      "speaker without any subscription",
      "headphones, don't add a membership",
      "a kettle, never auto-renew anything",
      "a desk lamp under $30",
    ]) {
      expect(requestsRecurring(p), p).toBe(false);
    }
  });

  it("returns a notice only when there is a conflict", () => {
    expect(noticesFor("headphones with subscriptions")).toHaveLength(1);
    expect(noticesFor("headphones with subscriptions")[0].code).toBe("RECURRING_REQUESTED");
    expect(noticesFor("headphones, no subscriptions")).toEqual([]);
  });

  it("keeps subscription words out of the agent's search query", () => {
    expect(heuristicParse("headphones under $150 with subscriptions").searchQuery).not.toMatch(/subscription/i);
  });
});

describe("intent parser (heuristic)", () => {
  it("parses the demo prompt", () => {
    const d = heuristicParse("Buy me noise-canceling headphones under $150, rated well, no subscriptions.");
    expect(d.maxTotal).toBe(150);
    expect(d.allowedCategories).toEqual(["electronics/headphones"]);
    expect(d.maxQuantity).toBe(1);
    expect(d.expiresInMinutes).toBe(120);
    expect(d.searchQuery.toLowerCase()).toContain("noise-canceling headphones");
    expect(d.searchQuery).not.toMatch(/\$|150|subscription/i);
  });

  it("extracts caps in several phrasings", () => {
    expect(extractCap("budget: $99.50 for a kettle")).toBe(99.5);
    expect(extractCap("max 200 dollars")).toBe(200);
    expect(extractCap("something for $45")).toBe(45);
    expect(extractCap("a nice speaker")).toBeNull();
  });

  it("reads quantities and defaults safely", () => {
    expect(heuristicParse("buy two pairs of running shoes under $200").maxQuantity).toBe(2);
    const d = heuristicParse("a nice gift");
    expect(d.maxTotal).toBe(100);
    expect(d.allowedCategories).toEqual(["electronics"]);
  });
});
