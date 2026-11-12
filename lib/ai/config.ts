import { env } from "@/lib/env";

/** True when an AI provider, model and key are all set. Without it, Covenant uses its deterministic fallbacks. */
export function isAIConfigured(): boolean {
  const e = env();
  return !!(e.AI_PROVIDER && e.AI_MODEL && e.AI_API_KEY);
}
