import { z } from "zod";
import { requireEnv } from "@/lib/env";
import { RECURRING_RE } from "@/lib/gate/rules";
import type { CatalogProduct } from "@/lib/types";

/**
 * Minimal Channel3 REST client (https://docs.trychannel3.com).
 *   POST /v1/search            — product search (costs credits)
 *   GET  /v1/products/{id}     — product detail (free) — the gate uses this to re-price carts
 * Only the fields Covenant needs are validated; everything else passes through.
 */

const BASE_URL = "https://api.trychannel3.com/v1";

const Offer = z
  .object({
    url: z.string(),
    domain: z.string(),
    price: z.object({ price: z.number(), currency: z.string() }).passthrough(),
    availability: z.string().nullish(),
  })
  .passthrough();

const Product = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullish(),
    brands: z.array(z.object({ name: z.string() }).passthrough()).nullish(),
    category: z
      .object({
        slug: z.string(),
        path: z.array(z.object({ slug: z.string() }).passthrough()).nullish(),
      })
      .passthrough()
      .nullish(),
    offers: z.array(Offer).nullish(),
    key_features: z.array(z.string()).nullish(),
  })
  .passthrough();
export type Channel3Product = z.infer<typeof Product>;

const SearchResponse = z.object({ products: z.array(Product), next_page_token: z.string().nullish() }).passthrough();

export type SearchFilters = {
  maxPrice?: number;
  minPrice?: number;
  category?: string;
  availability?: string[];
};

async function call<T>(path: string, init: RequestInit, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "x-api-key": requireEnv("CHANNEL3_API_KEY"), ...init.headers },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Channel3 ${init.method ?? "GET"} ${path} failed: ${res.status} ${body.slice(0, 200)}`);
  }
  return schema.parse(await res.json());
}

export async function searchProducts(query: string, filters: SearchFilters = {}, limit = 8): Promise<Channel3Product[]> {
  // Locale defaults to en / US / USD when unset (docs: guides/locale). The REST body rejects a top-level `currency`.
  const body: Record<string, unknown> = { query, limit };
  const f: Record<string, unknown> = {
    availability: filters.availability ?? ["InStock", "LimitedAvailability"],
  };
  if (filters.maxPrice !== undefined || filters.minPrice !== undefined) {
    f.price = { min_price: filters.minPrice, max_price: filters.maxPrice };
  }
  if (filters.category) f.category = filters.category;
  body.filters = f;
  const res = await call("/search", { method: "POST", body: JSON.stringify(body) }, SearchResponse);
  return res.products;
}

export async function getProduct(productId: string): Promise<Channel3Product | null> {
  try {
    return await call(`/products/${encodeURIComponent(productId)}?currency=USD`, { method: "GET" }, Product);
  } catch (e) {
    if (e instanceof Error && / 404 /.test(e.message)) return null;
    throw e;
  }
}

const AVAILABLE = new Set(["InStock", "LimitedAvailability"]);

/** Deterministic offer choice: cheapest available USD offer (search and gate must agree). */
export function pickOffer(p: Channel3Product) {
  const offers = (p.offers ?? []).filter((o) => o.price.currency === "USD");
  const available = offers.filter((o) => !o.availability || AVAILABLE.has(o.availability));
  const pool = available.length ? available : offers;
  return pool.slice().sort((a, b) => a.price.price - b.price.price || a.domain.localeCompare(b.domain))[0];
}

/** Map a Channel3 product to Covenant's trusted CatalogProduct. Returns null if it has no USD offer. */
export function toCatalogProduct(p: Channel3Product): CatalogProduct | null {
  const offer = pickOffer(p);
  if (!offer) return null;
  const category = [...(p.category?.path ?? []).map((s) => s.slug), p.category?.slug]
    .filter((s): s is string => !!s)
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .join("/");
  return {
    productId: p.id,
    title: p.title,
    merchant: offer.domain,
    category: category || "uncategorized",
    unitPrice: { value: offer.price.price.toFixed(2), currency: offer.price.currency },
    isRecurring: RECURRING_RE.test(p.title),
    url: offer.url,
    description: [p.description ?? "", ...(p.key_features ?? [])].join(" ").trim(),
    source: "channel3",
  };
}
