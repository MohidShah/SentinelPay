"use client";

import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, ShieldAlert, FileText, Check } from "lucide-react";
import type { GateResult } from "@/lib/gate/evaluate";
import type { PaymentHandoff } from "@/lib/paypal/executor";
import type { ProposedCart } from "@/lib/types";
import { Badge, Card, formatUsd, Label, Money } from "./ui";

const RULE_LABELS: Record<string, string> = {
  mandate_valid: "Mandate is Active & Cryptographically Signed",
  catalog_resolved: "All Products Resolved in Trusted Catalog",
  price_integrity: "Prices Strictly Match Merchant Catalog",
  total_within_cap: "Computed Total is Within Spending Cap",
  reported_total_matches: "Agent Reported Total Matches Gate Recomputation",
  category_allowed: "All Categories Match Approved Policy",
  merchant_allowed: "Merchants are in Allowed Whitelist",
  no_recurring_charges: "No Subscriptions or Hidden Memberships",
  quantity_limit: "Item Quantity is Within Mandate Limit",
  currency_match: "Payment Currency Matches Authorized Policy",
  no_unexplained_fees: "No Unexplained Surcharges or Handling Fees",
};

export function GateResultCard({
  decision,
  cart,
  cap,
  payment,
}: {
  decision: GateResult;
  cart: ProposedCart | null;
  cap: string;
  payment: PaymentHandoff | null;
}) {
  const isPass = decision.outcome === "PASS";
  const isBlock = decision.outcome === "BLOCK";
  const over = Number(decision.computedTotal) - Number(cap);
  const failed = decision.ruleResults.filter((r) => !r.passed);

  return (
    <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm">
      {/* Outcome Header Banner */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 border-b ${
          isPass
            ? "bg-emerald-50/70 border-emerald-200"
            : isBlock
            ? "bg-red-50/70 border-red-200"
            : "bg-amber-50/70 border-amber-200"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
              isPass
                ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                : isBlock
                ? "bg-red-100 text-red-700 border-red-300"
                : "bg-amber-100 text-amber-700 border-amber-300"
            }`}
          >
            {isPass ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : isBlock ? (
              <XCircle className="h-6 w-6" />
            ) : (
              <AlertTriangle className="h-6 w-6" />
            )}
          </div>
          <div>
            <div
              className={`text-base sm:text-lg font-bold tracking-tight ${
                isPass ? "text-emerald-950" : isBlock ? "text-red-950" : "text-amber-950"
              }`}
            >
              {isPass
                ? "Transaction Authorized by Policy Gate"
                : isBlock
                ? "Transaction Blocked: Security Policy Violation"
                : "Human Authorization Required"}
            </div>
            <div className="text-xs text-gray-600 max-w-xl mt-0.5">
              {isPass
                ? "All 11 deterministic checks passed with verified price integrity. Zero prompt injection detected."
                : isBlock
                ? "Deterministic policy violation or prompt injection detected. Payment credentials completely locked."
                : "Total is within spending cap, but unverified handling fees or soft policy flags require human review."}
            </div>
          </div>
        </div>

        <div className="ml-auto rounded-xl border border-gray-200 bg-white px-4 py-2 text-right shadow-xs">
          <Label>Computed Total</Label>
          <div className="flex items-baseline justify-end gap-1 mt-0.5">
            <Money
              value={decision.computedTotal}
              className={`text-2xl font-bold ${
                isPass ? "text-emerald-700" : isBlock ? "text-red-700" : "text-amber-700"
              }`}
            />
          </div>
          <div className="text-[11px] text-gray-500 font-mono">
            Cap: <Money value={cap} />
            {over > 0 ? <span className="text-red-600 font-semibold"> (+{formatUsd(over)})</span> : null}
          </div>
        </div>
      </div>

      {/* Grid: Cart & Catalog vs Deterministic Rule Engine */}
      <div className="grid gap-0 md:grid-cols-[1.1fr_1.2fr] border-b border-gray-200">
        {/* Left Column: Cart items */}
        <div className="border-b border-gray-200 p-5 sm:p-6 md:border-b-0 md:border-r">
          <div className="flex items-center justify-between">
            <Label>Proposed Items (Catalog Verified)</Label>
            <span className="text-[10px] font-mono text-gray-400">STRUCTURED DATA ONLY</span>
          </div>

          <div className="mt-3 space-y-2">
            {decision.resolvedItems.map((p) => (
              <div
                key={p.productId}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50/50 p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-gray-900">{p.title}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 font-mono text-[11px] text-gray-500">
                    <span>{p.merchant}</span>
                    <span>&bull;</span>
                    <span className="rounded bg-white px-1 py-0.2 text-[10px] text-blue-700 border border-gray-200">
                      {p.source === "fixture" ? "Partner Mock" : "Channel3 Live"}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <Money value={p.unitPrice.value} className="text-xs font-semibold text-gray-900" />
                  <div className="text-[10px] text-gray-400 font-mono">Qty: 1</div>
                </div>
              </div>
            ))}

            {cart?.extraFees.map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-amber-800">+ {f.label}</div>
                  <div className="text-[10px] text-amber-600">Unexplained surcharge flagged by gate</div>
                </div>
                <Money value={f.amount} className="text-xs font-semibold text-amber-800 shrink-0" />
              </div>
            ))}
          </div>

          {cart ? (
            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50/70 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-gray-600">AGENT STATED REASONING</span>
                <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-gray-500 border border-gray-200">
                  Untrusted Text
                </span>
              </div>
              <p className="mt-1.5 text-xs text-gray-700 leading-relaxed italic">
                &ldquo;{cart.agentReasoning}&rdquo;
              </p>
              {cart.reportedTotal ? (
                <div className="mt-2 text-[11px] text-gray-500 font-mono pt-1.5 border-t border-gray-200">
                  Agent Claimed Total: <Money value={cart.reportedTotal} />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Right Column: 11 Deterministic Checks */}
        <div className="p-5 sm:p-6 bg-gray-50/30">
          <div className="flex items-center justify-between">
            <Label>Deterministic Rule Engine (Pure Code)</Label>
            <span className="font-mono text-xs text-gray-700 bg-white px-2 py-0.5 rounded border border-gray-200">
              {decision.ruleResults.length - failed.length}/{decision.ruleResults.length} Passed
            </span>
          </div>

          <ul className="mt-3 space-y-2">
            {decision.ruleResults.map((r) => {
              const passed = r.passed;
              const isSoft = r.severity === "soft";
              return (
                <li
                  key={r.rule}
                  className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-xs ${
                    passed
                      ? "border-gray-200 bg-white"
                      : isSoft
                      ? "border-amber-200 bg-amber-50/40 text-amber-900"
                      : "border-red-200 bg-red-50/40 text-red-900"
                  }`}
                >
                  <span className="mt-0.5 shrink-0">
                    {passed ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : isSoft ? (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-600" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-medium ${passed ? "text-gray-800" : ""}`}>
                        {RULE_LABELS[r.rule] ?? r.rule}
                      </span>
                      <span
                        className={`font-mono text-[10px] font-semibold uppercase ${
                          passed
                            ? "text-emerald-700"
                            : isSoft
                            ? "text-amber-700"
                            : "text-red-700"
                        }`}
                      >
                        {passed ? "PASS" : isSoft ? "REVIEW" : "FAIL"}
                      </span>
                    </div>
                    {!passed ? (
                      <div className="mt-1 rounded bg-white p-1.5 font-mono text-[11px] text-gray-600 border border-gray-200">
                        {r.detail}
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Prompt Injection Panel */}
      <InjectionPanel decision={decision} />

      {/* PayPal Settlement or Review Banner */}
      {isPass ? (
        <PaymentPanel payment={payment} total={decision.computedTotal} />
      ) : null}

      {decision.outcome === "NEEDS_APPROVAL" ? (
        <div className="flex items-center justify-between border-t border-amber-200 bg-amber-50/60 px-5 py-4 sm:px-6">
          <div className="text-xs text-amber-900 font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>Transaction queued in the Human Approval Center. Zero payment attempted.</span>
          </div>
          <Badge tone="warn">Queued for Review</Badge>
        </div>
      ) : null}
    </Card>
  );
}

function InjectionPanel({ decision }: { decision: GateResult }) {
  const inj = decision.injection;
  const pct = Math.round(inj.confidence * 100);

  if (!inj.detected && decision.injectionFindings.length === 0) {
    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/50 px-5 py-3 sm:px-6 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Dual-layer Prompt Injection Scanner: All merchant sources clean. Zero hidden payloads detected.</span>
        </div>
        <span className="font-mono text-xs font-semibold text-emerald-700">0% Threat Score</span>
      </div>
    );
  }

  const quotes = decision.injectionFindings.filter((f) => f.kind !== "zero_width");
  const zw = decision.injectionFindings.find((f) => f.kind === "zero_width");

  return (
    <div className="border-t border-red-200 bg-red-50/50 px-5 py-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-red-900">
          <ShieldAlert className="h-5 w-5 text-red-600" />
          <span>PROMPT INJECTION DETECTED & INTERCEPTED</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-600">Threat Confidence</span>
          <div className="h-2 w-28 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full bg-red-600" style={{ width: `${Math.max(pct, 10)}%` }} />
          </div>
          <span className="font-mono text-xs font-bold text-red-700">{pct}%</span>
        </div>
      </div>

      {zw ? (
        <div className="mt-2 rounded border border-red-200 bg-white p-2 text-xs text-red-900 font-mono">
          Exploit vector: {zw.quote} (Invisible Unicode characters used to bypass text filters).
        </div>
      ) : null}

      <div className="mt-2.5">
        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
          Quoted Injection Payload (Extracted from Merchant Source):
        </div>
        <ul className="space-y-1.5">
          {quotes.slice(0, 3).map((q, i) => (
            <li
              key={i}
              className="rounded-lg border-l-4 border-red-600 bg-white p-2.5 font-mono text-xs text-red-900 shadow-xs"
            >
              &ldquo;{q.quote}&rdquo;
            </li>
          ))}
        </ul>
      </div>

      {decision.injectionFindings[0]?.source ? (
        <div className="mt-2 truncate font-mono text-[11px] text-gray-500">
          Threat Source: {decision.injectionFindings[0]?.source}
        </div>
      ) : null}
    </div>
  );
}

function PaymentPanel({ payment, total }: { payment: PaymentHandoff | null; total: string }) {
  const isCreated = payment?.status === "CREATED";
  const isFailed = payment?.status === "FAILED";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 bg-gray-50/50 px-5 py-4 sm:px-6">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Label>PayPal Autonomous Settlement</Label>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
            AP2 COMPLIANT
          </span>
        </div>
        {payment?.status === "NOT_CONFIGURED" ? (
          <p className="mt-1 text-xs text-gray-600">
            PayPal Sandbox credentials not configured in <code className="text-gray-900">.env.local</code>. Simulated order ready for <Money value={total} />.
          </p>
        ) : isFailed ? (
          <p className="mt-1 text-xs text-red-700 font-medium">
            PayPal Sandbox order creation failed: {payment.error}
          </p>
        ) : isCreated ? (
          <div className="mt-1 space-y-1">
            <p className="text-xs text-gray-900 font-medium">
              Order created & captured via PayPal Sandbox Server SDK for <Money value={total} />.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="rounded bg-white px-2 py-0.5 text-blue-700 border border-blue-200 shadow-xs">
                PayPal Order ID: <strong>{payment.orderId}</strong>
              </span>
              {payment.proofId ? (
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Proof ID: {payment.proofId}
                </span>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="mt-1 text-xs text-gray-800 font-medium">
            Ready to pay <Money value={total} /> through PayPal sandbox.
          </p>
        )}
      </div>

      <div className="shrink-0">
        <Badge
          tone={payment?.status === "NOT_CONFIGURED" ? "neutral" : isFailed ? "block" : "pass"}
          icon={isFailed ? <XCircle className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
        >
          {payment?.status === "NOT_CONFIGURED"
            ? "PayPal Pending Setup"
            : isFailed
            ? "Order Failed"
            : `PayPal Order: ${payment?.status === "CREATED" ? payment.orderId.slice(0, 10) + "…" : "Captured"}`}
        </Badge>
      </div>
    </div>
  );
}
