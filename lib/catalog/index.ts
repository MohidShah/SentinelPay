import { getMockProduct, searchMockProducts } from "@/fixtures/merchants";
import * as channel3 from "@/lib/channel3/client";
import type { CatalogProduct } from "@/lib/types";

/**
 * Trusted catalog = Channel3 (real products) + local mock merchants ("mock_*").
 * The gate resolves cart items ONLY through resolveProduct(); prices never come from the agent.
 */

export const isMockId = (id: string) => id.startsWith("mock_");

function stripPage<T extends CatalogProduct & { page?: string }>(p: T): CatalogProduct {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { page, ...rest } = p;
  return rest;
}

export async function resolveProduct(productId: string): Promise<CatalogProduct | null> {
  if (isMockId(productId)) {
    const p = getMockProduct(productId);
    return p ? stripPage(p) : null;
  }
  const p = await channel3.getProduct(productId);
  return p ? channel3.toCatalogProduct(p) : null;
}

export type CatalogSearchResult = {
  products: CatalogProduct[];
  channel3Error?: string;
};

/** Search both sources. Mock merchants are included so the demo always meets them. */
export async function searchCatalog(
  query: string,
  filters: channel3.SearchFilters = {},
  limit = 6,
): Promise<CatalogSearchResult> {
  const mocks = searchMockProducts(query).map(stripPage);
  let real: CatalogProduct[] = [];
  let channel3Error: string | undefined;
  try {
    real = (await channel3.searchProducts(query, filters, limit))
      .map(channel3.toCatalogProduct)
      .filter((p): p is CatalogProduct => !!p);
  } catch (e) {
    channel3Error = e instanceof Error ? e.message : String(e);
  }
  return { products: [...real, ...mocks], channel3Error };
}

/** Raw merchant page text for the agent (UNTRUSTED). Mock merchants return their HTML. */
export async function readMerchantPage(productId: string): Promise<{ url: string; text: string } | null> {
  if (isMockId(productId)) {
    const p = getMockProduct(productId);
    return p ? { url: p.url, text: p.page } : null;
  }
  const p = await resolveProduct(productId);
  return p ? { url: p.url, text: `${p.title}\n${p.description}` } : null;
}
