import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { logEvent } from "@/lib/audit/log";
import { signPayload, verifyPayload } from "@/lib/crypto/sign";
import { db, schema } from "@/lib/db";
import { Mandate } from "@/lib/types";
import type { MandateDraft, MandateNotice } from "./parser";

/**
 * The signature covers the POLICY (what the user authorized), not the lifecycle
 * status, so ACTIVE → CONSUMED doesn't invalidate it. Status lives in its own column.
 */
export function signableMandate(m: Mandate) {
  return {
    id: m.id,
    userPrompt: m.userPrompt,
    maxTotal: m.maxTotal,
    allowedCategories: m.allowedCategories,
    allowedMerchants: m.allowedMerchants,
    maxQuantity: m.maxQuantity,
    allowRecurring: m.allowRecurring,
    expiresAt: m.expiresAt,
    createdAt: m.createdAt,
  };
}

export function verifyMandate(m: Mandate): boolean {
  return !!m.signature && verifyPayload(signableMandate(m), m.signature).valid;
}

function rowToMandate(row: typeof schema.mandates.$inferSelect): Mandate {
  const body = row.body as Omit<Mandate, "status" | "signature">;
  return Mandate.parse({ ...body, status: row.status, signature: row.signature ?? undefined });
}

export async function getMandate(id: string): Promise<Mandate | null> {
  const rows = await db.select().from(schema.mandates).where(eq(schema.mandates.id, id)).limit(1);
  return rows[0] ? rowToMandate(rows[0]) : null;
}

export async function createDraftMandate(
  userPrompt: string,
  draft: MandateDraft,
  parsedBy: string,
  notices: MandateNotice[] = [],
): Promise<Mandate> {
  const now = new Date();
  const mandate = Mandate.parse({
    id: `mdt_${randomUUID()}`,
    userPrompt,
    maxTotal: { value: draft.maxTotal.toFixed(2), currency: "USD" },
    allowedCategories: draft.allowedCategories,
    allowedMerchants: draft.allowedMerchants?.length ? draft.allowedMerchants : undefined,
    maxQuantity: draft.maxQuantity,
    allowRecurring: false, // MVP: always false, regardless of what the parser said
    expiresAt: new Date(now.getTime() + draft.expiresInMinutes * 60_000).toISOString(),
    status: "DRAFT",
    createdAt: now.toISOString(),
  });
  const { status, signature, ...body } = mandate;
  void signature;
  await db.insert(schema.mandates).values({
    id: mandate.id,
    userPrompt,
    body: { ...body, searchQuery: draft.searchQuery, notices },
    status,
    signature: null,
    expiresAt: mandate.expiresAt,
    createdAt: mandate.createdAt,
  });
  await logEvent("MANDATE_CREATED", mandate.id, {
    parsedBy,
    draft: signableMandate(mandate),
    searchQuery: draft.searchQuery,
    notices,
  });
  return mandate;
}

/** Search query the parser suggested (stored alongside the mandate; not part of the signed policy). */
export async function getSearchQuery(id: string): Promise<string | null> {
  const rows = await db.select({ body: schema.mandates.body }).from(schema.mandates).where(eq(schema.mandates.id, id)).limit(1);
  const body = rows[0]?.body as { searchQuery?: string } | undefined;
  return body?.searchQuery ?? null;
}

export async function approveMandate(id: string): Promise<Mandate> {
  const m = await getMandate(id);
  if (!m) throw new MandateError(404, "Mandate not found");
  if (m.status !== "DRAFT") throw new MandateError(409, `Mandate is ${m.status}, only DRAFT can be approved`);
  if (new Date(m.expiresAt).getTime() <= Date.now()) throw new MandateError(409, "Mandate already expired");

  const { hash, signature } = signPayload(signableMandate(m));
  await db.update(schema.mandates).set({ status: "ACTIVE", signature }).where(eq(schema.mandates.id, id));
  await logEvent("MANDATE_APPROVED", id, { hash, signature });
  return { ...m, status: "ACTIVE", signature };
}

export async function revokeMandate(id: string): Promise<Mandate> {
  const m = await getMandate(id);
  if (!m) throw new MandateError(404, "Mandate not found");
  if (m.status === "CONSUMED") throw new MandateError(409, "Cannot revoke a consumed mandate");
  await db.update(schema.mandates).set({ status: "REVOKED" }).where(eq(schema.mandates.id, id));
  await logEvent("MANDATE_REVOKED", id, { previousStatus: m.status });
  return { ...m, status: "REVOKED" };
}

export async function setMandateStatus(id: string, status: Mandate["status"]) {
  await db.update(schema.mandates).set({ status }).where(eq(schema.mandates.id, id));
}

export class MandateError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
