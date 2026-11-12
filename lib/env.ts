import { z } from "zod";

/**
 * Server-side environment. Parsed lazily so `next build` and tests don't
 * fail when a key that a given code path doesn't need is missing.
 */
const EnvSchema = z.object({
  PAYPAL_CLIENT_ID: z.string().default(""),
  PAYPAL_CLIENT_SECRET: z.string().default(""),
  PAYPAL_ENVIRONMENT: z.enum(["sandbox"]).default("sandbox"),
  CHANNEL3_API_KEY: z.string().default(""),
  // Empty string in .env means "not chosen yet".
  AI_PROVIDER: z.preprocess((v) => (v === "" ? undefined : v), z.enum(["anthropic", "google"]).optional()),
  AI_MODEL: z.string().default(""),
  AI_API_KEY: z.string().default(""),
  SIGNING_PRIVATE_KEY: z.string().default(""),
  DATABASE_URL: z.string().default("file:./covenant.db"),
  DATABASE_AUTH_TOKEN: z.string().default(""),
  APP_BASE_URL: z.string().default(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | undefined;

export function env(): Env {
  if (!cached) cached = EnvSchema.parse(process.env);
  return cached;
}

/** Throws a clear error when a required key is empty. */
export function requireEnv<K extends keyof Env>(key: K): NonNullable<Env[K]> {
  const value = env()[key];
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${String(key)}`);
  }
  return value as NonNullable<Env[K]>;
}
