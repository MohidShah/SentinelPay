import { describe, expect, it } from "vitest";
import { createIntentProof, verifyIntentProof } from "@/lib/proofs/service";
import type { GateDecision, Mandate, ProposedCart } from "@/lib/types";

const mockMandate: Mandate = {
  id: "mand_test_123",
  userPrompt: "Buy headphones under $150",
  maxTotal: { value: "150.00", currency: "USD" },
  allowedCategories: ["electronics/headphones"],
  maxQuantity: 1,
  allowRecurring: false,
  expiresAt: new Date(Date.now() + 7200000).toISOString(),
  status: "ACTIVE",
  createdAt: new Date().toISOString(),
};

const mockCart: ProposedCart = {
  mandateId: "mand_test_123",
  items: [
    {
      productId: "prod_1",
      title: "Test Headphones",
      merchant: "audio_store",
      category: "electronics/headphones",
      unitPrice: { value: "129.99", currency: "USD" },
      quantity: 1,
      isRecurring: false,
    },
  ],
  extraFees: [],
  agentReasoning: "Best choice within budget",
  sourcesRead: [],
};

const mockDecision: GateDecision = {
  outcome: "PASS",
  computedTotal: "129.99",
  ruleResults: [{ rule: "total_within_cap", passed: true, detail: "Under cap", severity: "hard" }],
  injection: { detected: false, confidence: 0, evidence: [] },
};

describe("Intent Proof cryptographic verification", () => {
  it("creates a signed Intent Proof and verifies successfully", async () => {
    const proof = await createIntentProof({
      mandate: mockMandate,
      cart: mockCart,
      decision: mockDecision,
      paypalOrderId: "TEST_PAYPAL_ORD_999",
    });

    expect(proof.id).toMatch(/^proof_/);
    expect(proof.paypalOrderId).toBe("TEST_PAYPAL_ORD_999");
    expect(proof.hash).toBeDefined();
    expect(proof.signature).toBeDefined();

    const result = verifyIntentProof(proof);
    expect(result.valid).toBe(true);
    expect(result.hash).toBe(proof.hash);
  });

  it("tampering with any field causes verification to fail", async () => {
    const proof = await createIntentProof({
      mandate: mockMandate,
      cart: mockCart,
      decision: mockDecision,
      paypalOrderId: "TEST_PAYPAL_ORD_888",
    });

    // Tamper with PayPal Order ID
    const tampered = {
      ...proof,
      paypalOrderId: "TAMPERED_ORDER_ID_000",
    };

    const result = verifyIntentProof(tampered);
    expect(result.valid).toBe(false);
  });
});

