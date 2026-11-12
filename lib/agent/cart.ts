import type { ProposedCart } from "@/lib/types";
import type { AgentSession } from "./types";

export type CartPick = { productId: string; quantity: number };

/**
 * Build a ProposedCart from the agent's picks. Item fields come from the structured
 * product records the agent's tools returned — never from the model's free text.
 * The gate re-resolves every item from the catalog anyway.
 */
export function buildCart(args: {
  mandateId: string;
  picks: CartPick[];
  session: AgentSession;
  extraFees?: { label: string; amount: string }[];
  reasoning: string;
  reportedTotal?: string;
}): ProposedCart {
  const items = args.picks.map((pick) => {
    const p = args.session.seen.get(pick.productId);
    return {
      productId: pick.productId,
      title: p?.title ?? "(unknown product)",
      merchant: p?.merchant ?? "(unknown)",
      category: p?.category ?? "(unknown)",
      unitPrice: p?.unitPrice ?? { value: "0.00", currency: "USD" },
      quantity: pick.quantity,
      isRecurring: p?.isRecurring ?? false,
    };
  });
  return {
    mandateId: args.mandateId,
    items,
    extraFees: args.extraFees ?? [],
    agentReasoning: args.reasoning,
    reportedTotal: args.reportedTotal,
    sourcesRead: args.session.sourcesRead,
  };
}
