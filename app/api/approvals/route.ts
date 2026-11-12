import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(schema.approvals).orderBy(desc(schema.approvals.createdAt)).limit(100);
  return NextResponse.json({ approvals: rows });
}

