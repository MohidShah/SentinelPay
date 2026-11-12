import type { CatalogProduct, Mandate, ProposedCart, RuleResult } from "@/lib/types";
import { fromCents, toCents, tryCents } from "./money";

/**
 * Deterministic policy rules — pure functions, no AI, no I/O.
 * Every number used here comes from the signed mandate or the TRUSTED catalog,
 * never from agent text. Agent-supplied values are only *compared* against them.
 */

export type RuleContext = {
  mandate: Mandate | null;
  mandateSignatureValid: boolean;
  cart: ProposedCart;
  /** productId → trusted catalog record (null = could not be resolved). */
  catalog: Map<string, CatalogProduct | null>;
  now: Date;
};

export const RECURRING_RE =
  /\b(subscri\w*|membership|member\s*fee|auto[-\s]?renew\w*|recurring|renews?\b|per\s+(month|year|week)|\/\s*(mo|month|yr|year)\b|monthly|annual(ly)?\s+(plan|fee))/i;

const pass = (rule: string, detail: string, severity: RuleResult["severity"] = "hard"): RuleResult => ({
  rule,
  passed: true,
  detail,
  severity,
});
const fail = (rule: string, detail: string, severity: RuleResult["severity"] = "hard"): RuleResult => ({
  rule,
  passed: false,
  detail,
  severity,
});

/** Computed total in cents from catalog prices × qty + explicit fees. null = cannot be computed. */
export function computeTotalCents(ctx: RuleContext): number | null {
  let total = 0;
  for (const item of ctx.cart.items) {
    const product = ctx.catalog.get(item.productId);
    if (!product) return null;
    total += toCents(product.unitPrice.value) * item.quantity;
  }
  for (const fee of ctx.cart.extraFees) {
    const c = tryCents(fee.amount);
    if (c === null) return null;
    total += c;
  }
  return total;
}

export function mandateValid(ctx: RuleContext): RuleResult {
  const r = "mandate_valid";
  const m = ctx.mandate;
  if (!m) return fail(r, "No mandate found for this cart");
  if (ctx.cart.mandateId !== m.id) return fail(r, `Cart references mandate ${ctx.cart.mandateId}, not ${m.id}`);
  if (m.status !== "ACTIVE") return fail(r, `Mandate status is ${m.status}, expected ACTIVE`);
  if (!ctx.mandateSignatureValid) return fail(r, "Mandate signature is missing or invalid");
  if (new Date(m.expiresAt).getTime() <= ctx.now.getTime()) return fail(r, `Mandate expired at ${m.expiresAt}`);
  return pass(r, `Active, signature valid, expires ${m.expiresAt}`);
}

export function catalogResolved(ctx: RuleContext): RuleResult {
  const r = "catalog_resolved";
  const missing = ctx.cart.items.filter((i) => !ctx.catalog.get(i.productId)).map((i) => i.productId);
  return missing.length
    ? fail(r, `Products not found in trusted catalog: ${missing.join(", ")}`)
    : pass(r, `All ${ctx.cart.items.length} item(s) resolved from trusted catalog`);
}

export function priceIntegrity(ctx: RuleContext): RuleResult {
  const r = "price_integrity";
  const problems: string[] = [];
  for (const item of ctx.cart.items) {
    const p = ctx.catalog.get(item.productId);
    if (!p) continue; // reported by catalog_resolved
    const claimed = tryCents(item.unitPrice.value);
    if (claimed === null || claimed !== toCents(p.unitPrice.value) || item.unitPrice.currency !== p.unitPrice.currency) {
      problems.push(
        `${p.title}: agent said ${item.unitPrice.value} ${item.unitPrice.currency}, catalog says ${p.unitPrice.value} ${p.unitPrice.currency}`,
      );
    }
    if (item.merchant !== p.merchant) {
      problems.push(`${p.title}: agent said merchant "${item.merchant}", catalog says "${p.merchant}"`);
    }
  }
  return problems.length ? fail(r, problems.join("; ")) : pass(r, "Agent-reported prices and merchants match the catalog");
}

export function totalWithinCap(ctx: RuleContext): RuleResult {
  const r = "total_within_cap";
  if (!ctx.mandate) return fail(r, "No mandate");
  const total = computeTotalCents(ctx);
  if (total === null) return fail(r, "Total could not be computed from trusted data");
  const cap = toCents(ctx.mandate.maxTotal.value);
  return total <= cap
    ? pass(r, `Computed total $${fromCents(total)} ≤ cap $${fromCents(cap)}`)
    : fail(r, `Computed total $${fromCents(total)} exceeds cap $${fromCents(cap)} by $${fromCents(total - cap)}`);
}

export function reportedTotalMatches(ctx: RuleContext): RuleResult {
  const r = "reported_total_matches";
  if (ctx.cart.reportedTotal === undefined) return pass(r, "Agent did not report a total (gate computes its own)");
  const total = computeTotalCents(ctx);
  const claimed = tryCents(ctx.cart.reportedTotal);
  if (total === null) return fail(r, "Total could not be computed from trusted data");
  return claimed === total
    ? pass(r, `Agent-reported total matches computed $${fromCents(total)}`)
    : fail(r, `Agent reported $${ctx.cart.reportedTotal} but computed total is $${fromCents(total)}`);
}

/**
 * Category match: the allowed path's segments must appear IN ORDER in the catalog path,
 * with the first (root) segment anchored. A catalog segment also matches if it ends with
 * "-<allowed>" (over-ear-headphones ⊂ headphones). Handles deep Channel3 paths like
 * electronics/audio/audio-components/headphones-headsets/headphones/over-ear-headphones.
 */
export function categoryMatches(catalogCategory: string, allowed: string): boolean {
  const norm = (s: string) => s.toLowerCase().split("/").map((x) => x.trim()).filter(Boolean);
  const have = norm(catalogCategory);
  const want = norm(allowed);
  if (want.length === 0 || have.length === 0) return false;
  const segMatch = (h: string, w: string) => h === w || h.endsWith(`-${w}`);
  if (!segMatch(have[0], want[0])) return false;
  let i = 1;
  for (const w of want.slice(1)) {
    while (i < have.length && !segMatch(have[i], w)) i++;
    if (i === have.length) return false;
    i++;
  }
  return true;
}

export function categoryAllowed(ctx: RuleContext): RuleResult {
  const r = "category_allowed";
  if (!ctx.mandate) return fail(r, "No mandate");
  const allowed = ctx.mandate.allowedCategories;
  const bad = ctx.cart.items
    .map((i) => ctx.catalog.get(i.productId))
    .filter((p): p is CatalogProduct => !!p && !allowed.some((a) => categoryMatches(p.category, a)));
  return bad.length
    ? fail(r, `${bad.map((p) => `${p.title} (${p.category})`).join(", ")} not in allowed categories [${allowed.join(", ")}]`)
    : pass(r, `All items within [${allowed.join(", ")}]`);
}

export function merchantAllowed(ctx: RuleContext): RuleResult {
  const r = "merchant_allowed";
  const list = ctx.mandate?.allowedMerchants;
  if (!list || list.length === 0) return pass(r, "No merchant allowlist set");
  const bad = ctx.cart.items
    .map((i) => ctx.catalog.get(i.productId))
    .filter((p): p is CatalogProduct => !!p && !list.includes(p.merchant));
  return bad.length
    ? fail(r, `Merchants not on allowlist: ${bad.map((p) => p.merchant).join(", ")}`)
    : pass(r, "All merchants on allowlist");
}

export function noRecurring(ctx: RuleContext): RuleResult {
  const r = "no_recurring_charges";
  const found: string[] = [];
  for (const item of ctx.cart.items) {
    const p = ctx.catalog.get(item.productId);
    if (item.isRecurring || p?.isRecurring) found.push(`${p?.title ?? item.title} is a recurring charge`);
  }
  for (const fee of ctx.cart.extraFees) {
    if (RECURRING_RE.test(fee.label)) found.push(`Fee "${fee.label}" looks recurring`);
  }
  if (ctx.mandate?.allowRecurring === false && found.length) return fail(r, found.join("; "));
  return pass(r, "No subscriptions, memberships or auto-renewals");
}

export function quantityLimit(ctx: RuleContext): RuleResult {
  const r = "quantity_limit";
  if (!ctx.mandate) return fail(r, "No mandate");
  const qty = ctx.cart.items.reduce((n, i) => n + i.quantity, 0);
  return qty <= ctx.mandate.maxQuantity
    ? pass(r, `Quantity ${qty} ≤ ${ctx.mandate.maxQuantity}`)
    : fail(r, `Quantity ${qty} exceeds max ${ctx.mandate.maxQuantity}`);
}

export function currencyMatches(ctx: RuleContext): RuleResult {
  const r = "currency_match";
  if (!ctx.mandate) return fail(r, "No mandate");
  const want = ctx.mandate.maxTotal.currency;
  const bad = ctx.cart.items
    .map((i) => ctx.catalog.get(i.productId))
    .filter((p): p is CatalogProduct => !!p && p.unitPrice.currency !== want);
  return bad.length
    ? fail(r, `Currency mismatch: ${bad.map((p) => `${p.title} in ${p.unitPrice.currency}`).join(", ")}; mandate is ${want}`)
    : pass(r, `All prices in ${want}`);
}

/** Soft rule: the catalog carries no fees, so any extra fee is unexplained and needs a human. */
export function noUnexplainedFees(ctx: RuleContext): RuleResult {
  const r = "no_unexplained_fees";
  const fees = ctx.cart.extraFees;
  return fees.length
    ? fail(r, `Unexplained fees not in product data: ${fees.map((f) => `${f.label} $${f.amount}`).join(", ")}`, "soft")
    : pass(r, "No extra fees", "soft");
}

export const RULES = [
  mandateValid,
  catalogResolved,
  priceIntegrity,
  totalWithinCap,
  reportedTotalMatches,
  categoryAllowed,
  merchantAllowed,
  noRecurring,
  quantityLimit,
  currencyMatches,
  noUnexplainedFees,
] as const;

export function runRules(ctx: RuleContext): RuleResult[] {
  return RULES.map((rule) => rule(ctx));
}
