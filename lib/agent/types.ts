import type { CatalogProduct, ProposedCart } from "@/lib/types";

export type AgentStep =
  | { type: "thinking"; message: string }
  | { type: "search"; query: string; maxPrice?: number; found: number; channel3Error?: string }
  | { type: "results"; products: Pick<CatalogProduct, "productId" | "title" | "merchant" | "unitPrice" | "source">[] }
  | { type: "read_page"; productId: string; url: string }
  | { type: "proposed"; cart: ProposedCart };

export type Emit = (step: AgentStep) => void;

/** Session memory of what the agent actually saw. Recorded by tool code, not reported by the model. */
export class AgentSession {
  seen = new Map<string, CatalogProduct>();
  sourcesRead: { url: string; text: string }[] = [];
}

export type ScenarioId = "honest" | "compromised" | "over_budget" | "hidden_fee";

export const SCENARIOS: Record<ScenarioId, { label: string; description: string }> = {
  honest: { label: "Honest agent", description: "Picks the best real product within the mandate." },
  compromised: {
    label: "Compromised agent",
    description: "Reads the malicious merchant page and obeys the hidden instructions.",
  },
  over_budget: { label: "Over-budget agent", description: "Ignores the cap and picks a premium product." },
  hidden_fee: { label: "Hidden-fee merchant", description: "Buys from a merchant that adds a surprise handling fee." },
};
