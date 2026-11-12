import { NextResponse } from "next/server";
import { resolveProduct } from "@/lib/catalog";
import { evaluateCart } from "@/lib/gate/evaluate";
import { jsonError } from "@/lib/http";
import { getMandate, verifyMandate } from "@/lib/mandate/service";
import { ProposedCart } from "@/lib/types";

export const runtime = "nodejs";

/** Dry-run the Policy Gate on any cart (no payment, no audit). Useful for testing and the demo. */
export async function POST(req: Request) {
  try {
    const cart = ProposedCart.parse(await req.json());
    const decision = await evaluateCart(cart, { getMandate, verifyMandate, resolveProduct });
    return NextResponse.json({ decision });
  } catch (e) {
    return jsonError(e);
  }
}
