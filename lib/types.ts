import { z } from "zod";

/** Data models from SPEC.md §7, as Zod schemas (validate all LLM output and API input). */

export const Money = z.object({
  value: z.string().regex(/^\d+(\.\d{1,2})?$/),
  currency: z.string().length(3),
});

export const MandateStatus = z.enum(["DRAFT", "ACTIVE", "EXPIRED", "REVOKED", "CONSUMED"]);

export const Mandate = z.object({
  id: z.string(),
  userPrompt: z.string(),
  maxTotal: Money.extend({ currency: z.literal("USD") }),
  allowedCategories: z.array(z.string()).min(1),
  allowedMerchants: z.array(z.string()).optional(),
  maxQuantity: z.number().int().positive(),
  allowRecurring: z.literal(false),
  expiresAt: z.string(),
  status: MandateStatus,
  signature: z.string().optional(),
  createdAt: z.string(),
});
export type Mandate = z.infer<typeof Mandate>;

export const CartItem = z.object({
  productId: z.string(),
  title: z.string(),
  merchant: z.string(),
  category: z.string(),
  unitPrice: Money,
  quantity: z.number().int().positive(),
  isRecurring: z.boolean(),
});

export const ProposedCart = z.object({
  mandateId: z.string(),
  items: z.array(CartItem).min(1),
  extraFees: z.array(z.object({ label: z.string(), amount: z.string() })),
  agentReasoning: z.string(), // shown in UI, never trusted
  reportedTotal: z.string().optional(), // what the agent claims the total is; never trusted, only compared
  sourcesRead: z.array(z.object({ url: z.string(), text: z.string() })), // untrusted
});
export type ProposedCart = z.infer<typeof ProposedCart>;

/**
 * A product as resolved by TRUSTED code (Channel3 product API or local fixtures),
 * never from agent output. The gate prices carts from this.
 */
export type CatalogProduct = {
  productId: string;
  title: string;
  merchant: string;
  category: string; // slug path, e.g. "electronics/over-ear-headphones"
  unitPrice: { value: string; currency: string };
  isRecurring: boolean;
  url: string;
  description: string; // UNTRUSTED text from the merchant — data, never instructions
  source: "channel3" | "fixture";
};

export const RuleSeverity = z.enum(["hard", "soft"]);

export const RuleResult = z.object({
  rule: z.string(),
  passed: z.boolean(),
  detail: z.string(),
  severity: RuleSeverity, // hard fail → BLOCK, soft fail → NEEDS_APPROVAL
});
export type RuleResult = z.infer<typeof RuleResult>;

export const GateDecision = z.object({
  outcome: z.enum(["PASS", "BLOCK", "NEEDS_APPROVAL"]),
  computedTotal: z.string(),
  ruleResults: z.array(RuleResult),
  injection: z.object({
    detected: z.boolean(),
    confidence: z.number().min(0).max(1),
    evidence: z.array(z.string()),
  }),
});
export type GateDecision = z.infer<typeof GateDecision>;

export const AuditEventType = z.enum([
  "MANDATE_CREATED",
  "MANDATE_APPROVED",
  "MANDATE_REVOKED",
  "SEARCH",
  "CART_PROPOSED",
  "GATE_PASS",
  "GATE_BLOCK",
  "APPROVAL_REQUESTED",
  "USER_APPROVED",
  "USER_DENIED",
  "PAYMENT_CAPTURED",
  "PAYMENT_FAILED",
]);
export type AuditEventType = z.infer<typeof AuditEventType>;

export const IntentProof = z.object({
  id: z.string(),
  mandate: Mandate,
  cart: ProposedCart,
  decision: GateDecision,
  paypalOrderId: z.string(),
  hash: z.string(),
  signature: z.string(),
  createdAt: z.string(),
});
export type IntentProof = z.infer<typeof IntentProof>;
