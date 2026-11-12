import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { getMandate, verifyMandate } from "@/lib/mandate/service";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const mandate = await getMandate(id);
    if (!mandate) return NextResponse.json({ error: "Mandate not found" }, { status: 404 });
    return NextResponse.json({ mandate, signatureValid: verifyMandate(mandate) });
  } catch (e) {
    return jsonError(e);
  }
}
