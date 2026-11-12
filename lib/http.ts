import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { MandateError } from "@/lib/mandate/service";

export function jsonError(e: unknown) {
  if (e instanceof MandateError) return NextResponse.json({ error: e.message }, { status: e.status });
  if (e instanceof ZodError) return NextResponse.json({ error: "Invalid request", issues: e.issues }, { status: 400 });
  console.error(e);
  return NextResponse.json({ error: e instanceof Error ? e.message : "Internal error" }, { status: 500 });
}
