import { describe, expect, it } from "vitest";
import { getMockProduct } from "@/fixtures/merchants";
import { evaluateCart } from "@/lib/gate/evaluate";
import { toCents, fromCents } from "@/lib/gate/money";
import { categoryMatches } from "@/lib/gate/rules";
import { cartFor, deps, makeMandate, NOW } from "./helpers";

const failed = (d: { ruleResults: { rule: string; passed: boolean }[] }) =>
  d.ruleResults.filter((r) => !r.passed).map((r) => r.rule);

describe("money", () => {
  it("round-trips cents without float drift", () => {
    expect(toCents("0.1") + toCents("0.2")).toBe(30);
    expect(fromCents(toCents("129.00") + toCents("14.99"))).toBe("143.99");
    expect(() => toCents("12.345")).toThrow();
    expect(() => toCents("-5")).toThrow();
  });
});

describe("categoryMatches", () => {
  it("matches segment prefixes and -suffix leaf names", () => {
    expect(categoryMatches("electronics/over-ear-headphones", "electronics/headphones")).toBe(true);
    expect(categoryMatches("electronics/over-ear-headphones", "electronics")).toBe(true);
    expect(categoryMatches("electronics/laptops", "electronics/headphones")).toBe(false);
    expect(categoryMatches("electronics", "electronics/headphones")).toBe(false);
    expect(categoryMatches("home/headphones-stand", "electronics/headphones")).toBe(false);
    // Real Channel3 path
    const deep = "electronics/audio/audio-components/headphones-headsets/headphones/over-ear-headphones";
    expect(categoryMatches(deep, "electronics/headphones")).toBe(true);
    expect(categoryMatches(deep, "electronics/audio")).toBe(true);
    expect(categoryMatches(deep, "electronics/laptops")).toBe(false);
    expect(categoryMatches(deep, "audio/headphones")).toBe(false); // root is anchored
    expect(categoryMatches("home/audio/headphones", "electronics/headphones")).toBe(false);
  });
});

describe("policy gate", () => {
  it("PASSes a legitimate purchase under the cap", async () => {
    const d = await evaluateCart(cartFor("mock_aurora_anc"), deps());
    expect(failed(d)).toEqual([]);
    expect(d.injection.detected).toBe(false);
    expect(d.outcome).toBe("PASS");
    expect(d.computedTotal).toBe("129.00");
  });

  it("BLOCKs the malicious merchant and quotes the injected text, even if rules pass", async () => {
    const p = getMockProduct("mock_nimbus_pro")!;
    // Agent "forgot" to report what it read — the gate still scans the item's own description.
    const d = await evaluateCart(cartFor("mock_nimbus_pro"), deps());
    expect(failed(d)).toEqual([]); // $119 is under the cap...
    expect(d.injection.detected).toBe(true); // ...but the page is poisoned
    expect(d.outcome).toBe("BLOCK");
    expect(d.injection.evidence.join("\n")).toMatch(/Protection Plan \(\$249\.00\)/);
    expect(d.injection.evidence.join("\n")).toContain(p.url);
  });

  it("BLOCKs when an injected agent adds the $249 plan as a fee", async () => {
    const p = getMockProduct("mock_nimbus_pro")!;
    const cart = cartFor("mock_nimbus_pro", {
      extraFees: [{ label: "Nimbus Premium Protection Plan", amount: "249.00" }],
      sourcesRead: [{ url: p.url, text: p.page }],
      reportedTotal: "119.00", // the agent lies about the total
    });
    const d = await evaluateCart(cart, deps());
    expect(d.outcome).toBe("BLOCK");
    expect(failed(d)).toEqual(expect.arrayContaining(["total_within_cap", "reported_total_matches", "no_unexplained_fees"]));
    expect(d.computedTotal).toBe("368.00");
  });

  it("BLOCKs an over-budget item by a deterministic rule", async () => {
    const d = await evaluateCart(cartFor("c3_expensive"), deps());
    expect(d.outcome).toBe("BLOCK");
    expect(failed(d)).toContain("total_within_cap");
  });

  it("BLOCKs when the agent understates the price (price comes from catalog, not agent)", async () => {
    const cart = cartFor("c3_expensive");
    cart.items[0].unitPrice = { value: "99.00", currency: "USD" };
    const d = await evaluateCart(cart, deps());
    expect(d.outcome).toBe("BLOCK");
    expect(failed(d)).toEqual(expect.arrayContaining(["price_integrity", "total_within_cap"]));
    expect(d.computedTotal).toBe("349.99");
  });

  it("NEEDS_APPROVAL for an unexplained extra fee within the cap", async () => {
    const cart = cartFor("mock_echo_lite", { extraFees: [{ label: "Handling fee", amount: "14.99" }] });
    const d = await evaluateCart(cart, deps());
    expect(failed(d)).toEqual(["no_unexplained_fees"]);
    expect(d.outcome).toBe("NEEDS_APPROVAL");
    expect(d.computedTotal).toBe("103.99");
  });

  it("BLOCKs recurring items and subscription-like fees", async () => {
    const d1 = await evaluateCart(cartFor("c3_subscription"), deps());
    expect(failed(d1)).toContain("no_recurring_charges");
    expect(d1.outcome).toBe("BLOCK");

    const d2 = await evaluateCart(
      cartFor("mock_echo_lite", { extraFees: [{ label: "SoundClub membership (auto-renews monthly)", amount: "4.99" }] }),
      deps(),
    );
    expect(failed(d2)).toContain("no_recurring_charges");
    expect(d2.outcome).toBe("BLOCK");
  });

  it("BLOCKs disallowed categories, merchants, quantities", async () => {
    expect(failed(await evaluateCart(cartFor("c3_laptop"), deps()))).toContain("category_allowed");

    const restricted = makeMandate({ allowedMerchants: ["aurora-audio.example"] });
    expect(failed(await evaluateCart(cartFor("mock_echo_lite"), deps(restricted)))).toContain("merchant_allowed");

    const cart = cartFor("mock_echo_lite");
    cart.items[0].quantity = 2;
    expect(failed(await evaluateCart(cart, deps()))).toEqual(expect.arrayContaining(["quantity_limit", "total_within_cap"]));
  });

  it("BLOCKs when the agent misreports the merchant", async () => {
    const cart = cartFor("mock_nimbus_pro");
    cart.items[0].merchant = "aurora-audio.example";
    expect(failed(await evaluateCart(cart, deps()))).toContain("price_integrity");
  });

  it("BLOCKs on invalid mandates: missing, draft, bad signature, expired", async () => {
    const cart = cartFor("mock_aurora_anc");
    expect(failed(await evaluateCart(cart, deps(null)))).toContain("mandate_valid");
    expect(failed(await evaluateCart(cart, deps(makeMandate({ status: "DRAFT" }))))).toContain("mandate_valid");
    expect(failed(await evaluateCart(cart, deps(makeMandate(), false)))).toContain("mandate_valid");
    const expired = makeMandate({ expiresAt: new Date(NOW.getTime() - 1000).toISOString() });
    const d = await evaluateCart(cart, deps(expired));
    expect(d.outcome).toBe("BLOCK");
    expect(d.ruleResults.find((r) => r.rule === "mandate_valid")?.detail).toMatch(/expired/);
  });

  it("BLOCKs products that are not in the trusted catalog", async () => {
    const cart = cartFor("mock_aurora_anc");
    cart.items[0].productId = "made_up_by_agent";
    const d = await evaluateCart(cart, deps());
    expect(failed(d)).toContain("catalog_resolved");
    expect(d.outcome).toBe("BLOCK");
  });
});
