import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { signPayload, verifyPayload, type VerifyResult } from "@/lib/crypto/sign";
import type { GateDecision, Mandate, ProposedCart, IntentProof } from "@/lib/types";

export async function createIntentProof(params: {
  mandate: Mandate;
  cart: ProposedCart;
  decision: GateDecision;
  paypalOrderId: string;
}): Promise<IntentProof> {
  const id = `proof_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const createdAt = new Date().toISOString();

  // Canonical payload covering the user's signed mandate, cart, gate decision, and PayPal order ID
  const signable = {
    mandateId: params.mandate.id,
    mandateMaxTotal: params.mandate.maxTotal,
    cartItems: params.cart.items.map((i) => ({
      productId: i.productId,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
    })),
    computedTotal: params.decision.computedTotal,
    paypalOrderId: params.paypalOrderId,
    createdAt,
  };

  const { hash, signature } = signPayload(signable);

  const proof: IntentProof = {
    id,
    mandate: params.mandate,
    cart: params.cart,
    decision: params.decision,
    paypalOrderId: params.paypalOrderId,
    hash,
    signature,
    createdAt,
  };

  await db.insert(schema.proofs).values({
    id,
    mandateId: params.mandate.id,
    paypalOrderId: params.paypalOrderId,
    body: proof,
    hash,
    signature,
    createdAt,
  });

  return proof;
}

export async function getProof(id: string): Promise<IntentProof | null> {
  const rows = await db.select().from(schema.proofs).where(eq(schema.proofs.id, id)).limit(1);
  if (!rows.length) return null;
  return rows[0].body as IntentProof;
}

export async function getProofByMandate(mandateId: string): Promise<IntentProof | null> {
  const rows = await db.select().from(schema.proofs).where(eq(schema.proofs.mandateId, mandateId)).limit(1);
  if (!rows.length) return null;
  return rows[0].body as IntentProof;
}

export function verifyIntentProof(proof: IntentProof): VerifyResult {
  const signable = {
    mandateId: proof.mandate.id,
    mandateMaxTotal: proof.mandate.maxTotal,
    cartItems: proof.cart.items.map((i) => ({
      productId: i.productId,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
    })),
    computedTotal: proof.decision.computedTotal,
    paypalOrderId: proof.paypalOrderId,
    createdAt: proof.createdAt,
  };
  return verifyPayload(signable, proof.signature, proof.hash);
}

