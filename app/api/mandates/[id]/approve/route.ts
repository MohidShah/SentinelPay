import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { approveMandate, verifyMandate } from "@/lib/mandate/service";

export const runtime = "nodejs";

/** User approval: DRAFT → ACTIVE, signed with Ed25519. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const mandate = await approveMandate(id);
    return NextResponse.json({ mandate, signatureValid: verifyMandate(mandate) });
  } catch (e) {
    return jsonError(e);
  }
}
