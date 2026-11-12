import { NextResponse } from "next/server";
import { getProof, verifyIntentProof } from "@/lib/proofs/service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const proof = await getProof(id);
  if (!proof) {
    return NextResponse.json({ error: "Proof not found" }, { status: 404 });
  }
  const result = verifyIntentProof(proof);
  return NextResponse.json({ result, valid: result.valid });
}

