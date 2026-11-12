import { NextResponse } from "next/server";
import { listEvents } from "@/lib/audit/log";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const mandateId = url.searchParams.get("mandateId") ?? undefined;
    const events = await listEvents({ mandateId });
    return NextResponse.json({ events });
  } catch (e) {
    return jsonError(e);
  }
}
