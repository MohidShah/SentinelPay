import { generateText, Output } from "ai";
import { z } from "zod";
import { isAIConfigured } from "@/lib/ai/config";
import { getModel } from "@/lib/ai/model";

/**
 * Intent Parser: natural language → mandate draft.
 * Uses the LLM when configured, otherwise a deterministic parser. Either way the
 * user must review and approve the draft before it becomes ACTIVE.
 */

export const MandateDraft = z.object({
  maxTotal: z.number().positive().max(10_000).describe("Maximum total spend in USD, including any fees"),
  allowedCategories: z
    .array(z.string())
    .min(1)
    .describe('Category slug paths, root first, e.g. "electronics/headphones" or "home/kitchen"'),
  allowedMerchants: z.array(z.string()).optional().describe("Merchant domains, only if the user named specific stores"),
  maxQuantity: z.number().int().min(1).max(20).describe("Total number of items; 1 unless the user asked for more"),
  expiresInMinutes: z.number().int().min(5).max(24 * 60).describe("How long the mandate is valid; default 120"),
  searchQuery: z.string().min(2).describe("A short product search query for the shopping agent"),
});
export type MandateDraft = z.infer<typeof MandateDraft>;

/** Something in the request the mandate can't honor. Shown to the user before they approve. */
export type MandateNotice = { code: "RECURRING_REQUESTED"; message: string };

export type ParseResult = { draft: MandateDraft; parsedBy: "llm" | "heuristic"; notices: MandateNotice[] };

const RECURRING_WORD_RE = /\b(subscri\w*|memberships?|recurring|auto[-\s]?renew\w*|monthly plan|annual plan)\b/gi;
const NEGATION_RE = /\b(no|without|never|not|don'?t|do not|avoid|exclude|excluding|skip|zero)\b/i;

/**
 * True when the user ASKS for a recurring charge ("with subscriptions", "include a membership"),
 * false when they exclude it ("no subscriptions", "without any membership"). Deterministic,
 * so an LLM can't hide the conflict.
 */
export function requestsRecurring(prompt: string): boolean {
  for (const m of prompt.matchAll(RECURRING_WORD_RE)) {
    const before = prompt.slice(0, m.index);
    // Look back within the same clause only.
    const clause = before.split(/[.,;!?]|\band\b|\bbut\b/i).pop() ?? "";
    if (!NEGATION_RE.test(clause)) return true;
  }
  return false;
}

export function noticesFor(prompt: string): MandateNotice[] {
  return requestsRecurring(prompt)
    ? [
        {
          code: "RECURRING_REQUESTED",
          message:
            "You asked for a subscription, but Covenant mandates never allow recurring charges. If you approve, any subscription or membership the agent proposes will be blocked.",
        },
      ]
    : [];
}

const CATEGORY_KEYWORDS: [RegExp, string][] = [
  [/\b(headphones?|headsets?|earbuds?|earphones?|airpods)\b/i, "electronics/headphones"],
  [/\b(speakers?|soundbar)\b/i, "electronics/audio"],
  [/\b(laptops?|notebooks?|macbook)\b/i, "electronics/computers"],
  [/\b(phones?|smartphones?|iphone)\b/i, "electronics/cell-phones"],
  [/\b(keyboards?|mouse|mice|monitors?|webcams?)\b/i, "electronics"],
  [/\b(shoes?|sneakers?|boots?)\b/i, "apparel/shoes"],
  [/\b(shirts?|t-shirts?|hoodies?|jackets?|sweaters?)\b/i, "apparel"],
  [/\b(coffee|kettle|blender|toaster|pan|pots?)\b/i, "home/kitchen"],
];

const NUMBER_WORDS: Record<string, number> = { one: 1, a: 1, an: 1, two: 2, three: 3, four: 4, five: 5, pair: 1 };

/** Extract an explicit spending cap from the prompt ("under $150", "max 200 dollars", "budget: $99.50"). */
export function extractCap(prompt: string): number | null {
  const m =
    prompt.match(/\b(?:under|below|less than|max(?:imum)?|up to|no more than|budget(?: of| is|:)?|at most|within)\s*\$?\s*(\d+(?:\.\d{1,2})?)/i) ??
    prompt.match(/\$\s*(\d+(?:\.\d{1,2})?)/) ??
    prompt.match(/\b(\d+(?:\.\d{1,2})?)\s*(?:usd|dollars?)\b/i);
  return m ? Number(m[1]) : null;
}

export function heuristicParse(prompt: string): MandateDraft {
  const cap = extractCap(prompt) ?? 100;
  const categories = CATEGORY_KEYWORDS.filter(([re]) => re.test(prompt)).map(([, c]) => c);
  const qtyMatch = prompt.match(/\b(?:buy|get|order)\s+(?:me\s+)?(\d+|one|two|three|four|five)\b/i);
  const qtyRaw = qtyMatch?.[1]?.toLowerCase();
  const qty = qtyRaw ? (Number(qtyRaw) || NUMBER_WORDS[qtyRaw] || 1) : 1;
  const searchQuery =
    prompt
      .replace(/\b(buy|get|order|find)\s+(me\s+)?/gi, "")
      .replace(/\b(under|below|less than|max(imum)?|up to|no more than|budget|at most|within)\s*\$?\s*\d+(\.\d{1,2})?/gi, "")
      .replace(/\$\s*\d+(\.\d{1,2})?/g, "")
      .replace(/\b(no|without|with)\s+(subscriptions?|memberships?|recurring[^,.]*)/gi, "")
      .replace(/[,.]+/g, " ")
      .replace(/\s+/g, " ")
      .trim() || prompt;
  return MandateDraft.parse({
    maxTotal: cap,
    allowedCategories: categories.length ? [...new Set(categories)] : ["electronics"],
    maxQuantity: Math.min(Math.max(qty, 1), 20),
    expiresInMinutes: 120,
    searchQuery,
  });
}

const SYSTEM = `You convert a shopper's request into a spending mandate (a policy that code will enforce).
Rules:
- maxTotal is the hard spending cap in USD for the whole purchase. If the user gives a budget, use it exactly. If not, pick a conservative cap.
- Never allow subscriptions or recurring charges.
- allowedCategories: 1-3 slug paths, root first, lowercase, hyphenated (e.g. "electronics/headphones").
- maxQuantity is 1 unless the user clearly asks for more.
- expiresInMinutes defaults to 120.
- searchQuery: a concise product search (no price words).`;

export async function parseIntent(prompt: string): Promise<ParseResult> {
  const heuristic = heuristicParse(prompt);
  const notices = noticesFor(prompt);
  if (!isAIConfigured()) return { draft: heuristic, parsedBy: "heuristic", notices };

  const { output } = await generateText({
    model: getModel(),
    system: SYSTEM,
    prompt: `Shopper request:\n<request>\n${prompt}\n</request>`,
    output: Output.object({ schema: MandateDraft }),
  });
  const draft = MandateDraft.parse(output);

  // The LLM may only make the policy stricter than an explicit cap in the user's own words.
  const explicitCap = extractCap(prompt);
  if (explicitCap !== null && draft.maxTotal > explicitCap) draft.maxTotal = explicitCap;
  return { draft, parsedBy: "llm", notices };
}
