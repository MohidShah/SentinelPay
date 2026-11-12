import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";

/** JSON blobs are stored as text and validated with the Zod schemas in lib/types.ts. */

export const mandates = sqliteTable("mandates", {
  id: text("id").primaryKey(),
  userPrompt: text("user_prompt").notNull(),
  body: text("body", { mode: "json" }).notNull(), // full Mandate JSON (canonicalized for signing)
  status: text("status").notNull(),
  signature: text("signature"),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const auditEvents = sqliteTable("audit_events", {
  id: text("id").primaryKey(),
  mandateId: text("mandate_id"),
  type: text("type").notNull(),
  detail: text("detail", { mode: "json" }).notNull(),
  riskScore: real("risk_score"),
  createdAt: text("created_at").notNull(),
});

export const proofs = sqliteTable("proofs", {
  id: text("id").primaryKey(),
  mandateId: text("mandate_id").notNull(),
  paypalOrderId: text("paypal_order_id").notNull(),
  body: text("body", { mode: "json" }).notNull(), // IntentProof JSON
  hash: text("hash").notNull(),
  signature: text("signature").notNull(),
  createdAt: text("created_at").notNull(),
});

export const approvals = sqliteTable("approvals", {
  id: text("id").primaryKey(),
  mandateId: text("mandate_id").notNull(),
  cart: text("cart", { mode: "json" }).notNull(),
  decision: text("decision", { mode: "json" }).notNull(),
  status: text("status").notNull(), // PENDING | APPROVED | DENIED
  createdAt: text("created_at").notNull(),
  resolvedAt: text("resolved_at"),
});
