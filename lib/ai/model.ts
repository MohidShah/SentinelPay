import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogle } from "@ai-sdk/google";
import { requireEnv } from "@/lib/env";

/**
 * Provider-agnostic model factory. Switch providers by changing only
 * AI_PROVIDER / AI_MODEL / AI_API_KEY.
 */
export function getModel() {
  const provider = requireEnv("AI_PROVIDER");
  const modelId = requireEnv("AI_MODEL");
  const apiKey = requireEnv("AI_API_KEY");

  switch (provider) {
    case "anthropic":
      return createAnthropic({ apiKey })(modelId);
    case "google":
      return createGoogle({ apiKey })(modelId);
  }
}
