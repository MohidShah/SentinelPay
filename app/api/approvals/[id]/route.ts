import { NextResponse } from "next/server";
import { executeApprovalAction } from "@/lib/pipeline/run";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = body.action as "APPROVE" | "REJECT";

  if (action !== "APPROVE" && action !== "REJECT") {
    return NextResponse.json({ error: "Invalid action. Must be APPROVE or REJECT" }, { status: 400 });
  }

  const result = await executeApprovalAction(id, action);
  if (!result.success) {
    return NextResponse.json({ error: result.error ?? "Failed to process approval" }, { status: 400 });
  }

  return NextResponse.json(result);
}

