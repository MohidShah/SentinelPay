import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/http";
import { parseIntent } from "@/lib/mandate/parser";
import { createDraftMandate } from "@/lib/mandate/service";

export const runtime = "nodejs";

const Body = z.object({ prompt: z.string().trim().min(3).max(1000) });

/** Natural language → DRAFT mandate (not yet signed or usable), plus notices about anything it can't honor. */
export async function POST(req: Request) {
  try {
    const { prompt } = Body.parse(await req.json());
    const { draft, parsedBy, notices } = await parseIntent(prompt);
    const mandate = await createDraftMandate(prompt, draft, parsedBy, notices);
    return NextResponse.json({ mandate, parsedBy, notices, searchQuery: draft.searchQuery });
  } catch (e) {
    return jsonError(e);
  }
}
