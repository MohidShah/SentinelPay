import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { revokeMandate } from "@/lib/mandate/service";

export const runtime = "nodejs";

/** Mandate kill-switch: DRAFT/ACTIVE → REVOKED */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const mandate = await revokeMandate(id);
    return NextResponse.json({ mandate, status: "REVOKED" });
  } catch (e) {
    return jsonError(e);
  }
}

