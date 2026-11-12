import { z } from "zod";
import { jsonError } from "@/lib/http";
import { runPurchase, type PipelineEvent } from "@/lib/pipeline/run";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  mandateId: z.string(),
  mode: z.enum(["auto", "llm", "scripted"]).optional(),
  scenario: z.enum(["honest", "compromised", "over_budget", "hidden_fee"]).optional(),
});

/** Runs agent → gate → payment hand-off, streaming each step as NDJSON (one JSON object per line). */
export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch (e) {
    return jsonError(e);
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (e: PipelineEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      try {
        await runPurchase(body, emit);
      } catch (e) {
        emit({ type: "error", message: e instanceof Error ? e.message : String(e) });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
