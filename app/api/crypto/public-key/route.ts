import { NextResponse } from "next/server";
import { publicKeyPem } from "@/lib/crypto/sign";

export const runtime = "nodejs";

/** Public half of the signing key, so anyone can verify mandates and proofs independently. */
export async function GET() {
  return NextResponse.json({ algorithm: "Ed25519", publicKeyPem: publicKeyPem() });
}
