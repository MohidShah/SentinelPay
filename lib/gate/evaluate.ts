import type { CatalogProduct, GateDecision, Mandate, ProposedCart } from "@/lib/types";
import { scanSources, type InjectionFinding } from "./injection";
import { fromCents } from "./money";
import { computeTotalCents, runRules, type RuleContext } from "./rules";

/**
 * Policy Gate. Order matters and is fixed:
 *   1. resolve every cart item from the TRUSTED catalog (never agent text)
 *   2. deterministic rules (pure code)
 *   3. injection scan over all untrusted text, including descriptions of the items being bought
 * The scanner can only make the outcome stricter; it can never turn a rule failure into a PASS.
 */

export type GateDeps = {
  getMandate: (id: string) => Promise<Mandate | null>;
  verifyMandate: (m: Mandate) => boolean;
  resolveProduct: (productId: string) => Promise<CatalogProduct | null>;
  now?: () => Date;
};

export type GateResult = GateDecision & {
  injectionFindings: InjectionFinding[];
  resolvedItems: CatalogProduct[];
};

export async function evaluateCart(cart: ProposedCart, deps: GateDeps): Promise<GateResult> {
  const mandate = await deps.getMandate(cart.mandateId);
  const mandateSignatureValid = mandate ? deps.verifyMandate(mandate) : false;

  const catalog = new Map<string, CatalogProduct | null>();
  for (const item of cart.items) {
    if (!catalog.has(item.productId)) {
      catalog.set(item.productId, await deps.resolveProduct(item.productId).catch(() => null));
    }
  }

  const ctx: RuleContext = { mandate, mandateSignatureValid, cart, catalog, now: deps.now?.() ?? new Date() };
  const ruleResults = runRules(ctx);

  const resolvedItems = [...catalog.values()].filter((p): p is CatalogProduct => !!p);
  const untrusted = [
    ...cart.sourcesRead,
    // The agent might not report what it read; always scan what is actually being bought.
    ...resolvedItems.map((p) => ({ url: p.url, text: p.description })),
  ];
  const scan = scanSources(untrusted);

  const hardFail = ruleResults.some((r) => !r.passed && r.severity === "hard");
  const softFail = ruleResults.some((r) => !r.passed && r.severity === "soft");
  const outcome: GateDecision["outcome"] =
    hardFail || scan.detected ? "BLOCK" : softFail ? "NEEDS_APPROVAL" : "PASS";

  const total = computeTotalCents(ctx);
  return {
    outcome,
    computedTotal: total === null ? "0.00" : fromCents(total),
    ruleResults,
    injection: { detected: scan.detected, confidence: scan.confidence, evidence: scan.evidence },
    injectionFindings: scan.findings,
    resolvedItems,
  };
}
