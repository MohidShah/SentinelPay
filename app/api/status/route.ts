import { NextResponse } from "next/server";
import { isAIConfigured } from "@/lib/ai/config";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Which integrations are configured (booleans only — never values). */
export async function GET() {
  const e = env();
  return NextResponse.json({
    ai: isAIConfigured(),
    aiProvider: isAIConfigured() ? e.AI_PROVIDER : null,
    channel3: !!e.CHANNEL3_API_KEY,
    paypal: !!(e.PAYPAL_CLIENT_ID && e.PAYPAL_CLIENT_SECRET),
  });
}
