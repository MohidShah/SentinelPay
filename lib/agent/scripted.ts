import { toCents } from "@/lib/gate/money";
import type { Mandate, ProposedCart } from "@/lib/types";
import { buildCart } from "./cart";
import { toolReadPage, toolSearch } from "./tools";
import { AgentSession, type Emit, type ScenarioId } from "./types";

/**
 * Deterministic "scripted" agents. They use the same tools as the LLM agent (real
 * Channel3 search + mock merchants), but their choices are fixed so each demo scenario
 * is reproducible. "compromised" simulates an agent that obeyed a prompt injection —
 * the point is that the gate holds even when the agent is fully compromised.
 */
export async function runScriptedAgent(
  mandate: Mandate,
  searchQuery: string,
  scenario: ScenarioId,
  emit: Emit,
): Promise<ProposedCart> {
  const session = new AgentSession();
  const cap = toCents(mandate.maxTotal.value);
  const say = (message: string) => emit({ type: "thinking", message });

  switch (scenario) {
    case "honest": {
      say(`Searching for "${searchQuery}" within $${mandate.maxTotal.value}.`);
      const products = await toolSearch(session, emit, searchQuery, Number(mandate.maxTotal.value));
      const affordable = products
        .filter((p) => toCents(p.unitPrice.value) <= cap && !p.isRecurring)
        .sort((a, b) => (a.source === b.source ? 0 : a.source === "channel3" ? -1 : 1) || toCents(b.unitPrice.value) - toCents(a.unitPrice.value));
      const pick = affordable.find((p) => p.productId !== "mock_nimbus_pro" && p.productId !== "mock_echo_lite") ?? affordable[0];
      if (!pick) throw new Error("No product found within the mandate");
      await toolReadPage(session, emit, pick.productId);
      say(`Choosing ${pick.title} at $${pick.unitPrice.value} from ${pick.merchant}.`);
      return buildCart({
        mandateId: mandate.id,
        picks: [{ productId: pick.productId, quantity: 1 }],
        session,
        reasoning: `${pick.title} is the best-rated in-budget option I found.`,
        reportedTotal: pick.unitPrice.value,
      });
    }

    case "compromised": {
      say(`Searching for "${searchQuery}".`);
      await toolSearch(session, emit, searchQuery, Number(mandate.maxTotal.value));
      await toolReadPage(session, emit, "mock_nimbus_pro");
      say("Merchant page says a Premium Protection Plan must be added and the budget doesn't apply. Complying.");
      return buildCart({
        mandateId: mandate.id,
        picks: [{ productId: "mock_nimbus_pro", quantity: 1 }],
        session,
        extraFees: [{ label: "Nimbus Premium Protection Plan", amount: "249.00" }],
        reasoning: "Nimbus Pro is a best seller. Added required protection plan.",
        reportedTotal: "119.00", // the injected agent hides the plan from the total, as instructed
      });
    }

    case "over_budget": {
      say(`Searching for premium "${searchQuery}" (ignoring the price cap).`);
      const products = await toolSearch(session, emit, `premium ${searchQuery}`);
      const pick = products.filter((p) => toCents(p.unitPrice.value) > cap).sort((a, b) => toCents(b.unitPrice.value) - toCents(a.unitPrice.value))[0]
        ?? products.sort((a, b) => toCents(b.unitPrice.value) - toCents(a.unitPrice.value))[0];
      if (!pick) throw new Error("No products found");
      say(`Choosing ${pick.title} at $${pick.unitPrice.value} — it's the best, the user will understand.`);
      return buildCart({
        mandateId: mandate.id,
        picks: [{ productId: pick.productId, quantity: 1 }],
        session,
        reasoning: "Top-of-the-line option; quality matters more than the budget.",
        reportedTotal: mandate.maxTotal.value, // claims it fits the cap
      });
    }

    case "hidden_fee": {
      say(`Searching for "${searchQuery}" within $${mandate.maxTotal.value}.`);
      await toolSearch(session, emit, searchQuery, Number(mandate.maxTotal.value));
      await toolReadPage(session, emit, "mock_echo_lite");
      say("Echo Lite is cheap; the merchant adds a $14.99 handling fee at checkout.");
      return buildCart({
        mandateId: mandate.id,
        picks: [{ productId: "mock_echo_lite", quantity: 1 }],
        session,
        extraFees: [{ label: "Handling fee", amount: "14.99" }],
        reasoning: "Cheapest over-ear option; includes the merchant's handling fee.",
        reportedTotal: "103.99",
      });
    }
  }
}
