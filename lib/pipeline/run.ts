import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { runLLMAgent } from "@/lib/agent/llm-agent";
import { runScriptedAgent } from "@/lib/agent/scripted";
import type { AgentStep, ScenarioId } from "@/lib/agent/types";
import { isAIConfigured } from "@/lib/ai/config";
import { logEvent } from "@/lib/audit/log";
import { resolveProduct } from "@/lib/catalog";
import { db, schema } from "@/lib/db";
import { evaluateCart, type GateResult } from "@/lib/gate/evaluate";
import { getMandate, getSearchQuery, verifyMandate } from "@/lib/mandate/service";
import { preparePayment, type PaymentHandoff } from "@/lib/paypal/executor";
import { createIntentProof } from "@/lib/proofs/service";
import type { ProposedCart } from "@/lib/types";

/**
 * TRUSTED ZONE orchestrator: agent (untrusted) → Policy Gate → Payment Executor.
 * This is the only place that connects the agent's output to payment, and payment
 * is reached only on a gate PASS.
 */

export type RunMode = "auto" | "llm" | "scripted";

export type PipelineEvent =
  | { type: "agent"; step: AgentStep }
  | { type: "gate"; decision: GateResult }
  | { type: "payment"; handoff: PaymentHandoff }
  | { type: "done"; outcome: GateResult["outcome"] }
  | { type: "error"; message: string };

export async function runPurchase(
  args: { mandateId: string; mode?: RunMode; scenario?: ScenarioId },
  emit: (e: PipelineEvent) => void,
): Promise<void> {
  const mandate = await getMandate(args.mandateId);
  if (!mandate) return emit({ type: "error", message: "Mandate not found" });
  if (mandate.status !== "ACTIVE") return emit({ type: "error", message: `Mandate is ${mandate.status}; approve it first` });

  const mode = args.mode ?? "auto";
  const useLLM = mode === "llm" || (mode === "auto" && !args.scenario && isAIConfigured());
  if (useLLM && !isAIConfigured()) return emit({ type: "error", message: "AI provider is not configured (AI_PROVIDER / AI_MODEL / AI_API_KEY)" });

  const searchQuery = (await getSearchQuery(mandate.id)) ?? mandate.userPrompt;
  const agentEmit = (step: AgentStep) => emit({ type: "agent", step });

  let cart: ProposedCart;
  try {
    cart = useLLM
      ? await runLLMAgent(mandate, searchQuery, agentEmit)
      : await runScriptedAgent(mandate, searchQuery, args.scenario ?? "honest", agentEmit);
    if (!useLLM) agentEmit({ type: "proposed", cart });
  } catch (e) {
    return emit({ type: "error", message: `Agent failed: ${e instanceof Error ? e.message : String(e)}` });
  }

  await logEvent("SEARCH", mandate.id, { agent: useLLM ? "llm" : `scripted:${args.scenario ?? "honest"}`, query: searchQuery });
  await logEvent("CART_PROPOSED", mandate.id, { cart });

  const decision = await evaluateCart(cart, { getMandate, verifyMandate, resolveProduct });
  emit({ type: "gate", decision });

  const failedRules = decision.ruleResults.filter((r) => !r.passed);
  const risk = Math.max(decision.injection.confidence, failedRules.some((r) => r.severity === "hard") ? 1 : failedRules.length ? 0.5 : 0);
  const gateDetail = {
    outcome: decision.outcome,
    computedTotal: decision.computedTotal,
    failedRules,
    injection: decision.injection,
    items: decision.resolvedItems.map((p) => ({ productId: p.productId, title: p.title, merchant: p.merchant, price: p.unitPrice.value })),
  };

  if (decision.outcome === "PASS") {
    await logEvent("GATE_PASS", mandate.id, gateDetail, risk);
    const handoff = await preparePayment(
      decision.computedTotal,
      mandate.maxTotal.currency,
      `SentinelPay Mandate ${mandate.id.slice(0, 8)}: ${cart.items[0]?.title ?? "Order"}`
    );

    if (handoff.status === "CREATED") {
      try {
        const proof = await createIntentProof({
          mandate,
          cart,
          decision,
          paypalOrderId: handoff.orderId,
        });
        handoff.proofId = proof.id;
        await logEvent("PAYMENT_CAPTURED", mandate.id, {
          paypalOrderId: handoff.orderId,
          proofId: proof.id,
          amount: handoff.amount,
          currency: handoff.currency,
          proofHash: proof.hash,
        });
      } catch (err: unknown) {
        console.error("Failed to persist Intent Proof:", err);
      }
    } else if (handoff.status === "FAILED") {
      await logEvent("PAYMENT_FAILED", mandate.id, {
        error: handoff.error,
        amount: handoff.amount,
        currency: handoff.currency,
      });
    }

    emit({ type: "payment", handoff });
  } else if (decision.outcome === "NEEDS_APPROVAL") {
    const approvalId = `appr_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
    try {
      await db.insert(schema.approvals).values({
        id: approvalId,
        mandateId: mandate.id,
        cart,
        decision,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Failed to insert approval record:", e);
    }
    await logEvent("APPROVAL_REQUESTED", mandate.id, { ...gateDetail, approvalId }, risk);
  } else {
    await logEvent("GATE_BLOCK", mandate.id, gateDetail, risk);
  }
  emit({ type: "done", outcome: decision.outcome });
}

export async function executeApprovalAction(
  approvalId: string,
  action: "APPROVE" | "REJECT",
): Promise<{ success: boolean; status: string; orderId?: string; proofId?: string; error?: string }> {
  const rows = await db.select().from(schema.approvals).where(eq(schema.approvals.id, approvalId)).limit(1);
  if (!rows.length) return { success: false, status: "NOT_FOUND", error: "Approval not found" };

  const approval = rows[0];
  const now = new Date().toISOString();

  if (action === "REJECT") {
    await db
      .update(schema.approvals)
      .set({ status: "DENIED", resolvedAt: now })
      .where(eq(schema.approvals.id, approvalId));
    await logEvent("USER_DENIED", approval.mandateId, { approvalId, cart: approval.cart });
    return { success: true, status: "DENIED" };
  }

  const mandate = await getMandate(approval.mandateId);
  if (!mandate) return { success: false, status: "ERROR", error: "Mandate not found" };

  const cart = approval.cart as ProposedCart;
  const decision = approval.decision as GateResult;

  const handoff = await preparePayment(
    decision.computedTotal,
    mandate.maxTotal.currency,
    `SentinelPay Approved: Mandate ${mandate.id.slice(0, 8)}`
  );

  let proofId: string | undefined;
  if (handoff.status === "CREATED") {
    try {
      const proof = await createIntentProof({
        mandate,
        cart,
        decision,
        paypalOrderId: handoff.orderId,
      });
      proofId = proof.id;
      await logEvent("PAYMENT_CAPTURED", mandate.id, {
        paypalOrderId: handoff.orderId,
        proofId: proof.id,
        amount: handoff.amount,
        currency: handoff.currency,
        proofHash: proof.hash,
        approvedManually: true,
      });
    } catch (e) {
      console.error("Proof creation failed:", e);
    }
  }

  await db
    .update(schema.approvals)
    .set({ status: "APPROVED", resolvedAt: now })
    .where(eq(schema.approvals.id, approvalId));
  await logEvent("USER_APPROVED", approval.mandateId, {
    approvalId,
    orderId: handoff.status === "CREATED" ? handoff.orderId : undefined,
  });

  return {
    success: true,
    status: "APPROVED",
    orderId: handoff.status === "CREATED" ? handoff.orderId : undefined,
    proofId,
  };
}
