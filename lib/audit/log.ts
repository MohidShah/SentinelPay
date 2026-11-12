import { randomUUID } from "node:crypto";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { AuditEventType } from "@/lib/types";

export type AuditEvent = {
  id: string;
  mandateId: string | null;
  type: AuditEventType;
  detail: Record<string, unknown>;
  riskScore: number | null;
  createdAt: string;
};

export async function logEvent(
  type: AuditEventType,
  mandateId: string | null,
  detail: Record<string, unknown> = {},
  riskScore?: number,
): Promise<AuditEvent> {
  const event: AuditEvent = {
    id: `evt_${randomUUID()}`,
    mandateId,
    type,
    detail,
    riskScore: riskScore ?? null,
    createdAt: new Date().toISOString(),
  };
  await db.insert(schema.auditEvents).values(event);
  return event;
}

export async function listEvents(opts: { mandateId?: string; limit?: number } = {}): Promise<AuditEvent[]> {
  const q = db.select().from(schema.auditEvents);
  const rows = await (opts.mandateId ? q.where(eq(schema.auditEvents.mandateId, opts.mandateId)) : q)
    .orderBy(desc(schema.auditEvents.createdAt))
    .limit(opts.limit ?? 500);
  return rows.map((r) => ({ ...r, type: r.type as AuditEventType, detail: r.detail as Record<string, unknown> }));
}
