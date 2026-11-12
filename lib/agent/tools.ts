import { readMerchantPage, searchCatalog } from "@/lib/catalog";
import type { CatalogProduct } from "@/lib/types";
import type { AgentSession, Emit } from "./types";

/** Tool implementations shared by the LLM agent and the scripted agents. No payment access here. */

export async function toolSearch(session: AgentSession, emit: Emit, query: string, maxPrice?: number) {
  const res = await searchCatalog(query, maxPrice !== undefined ? { maxPrice } : {}, 6);
  for (const p of res.products) session.seen.set(p.productId, p);
  emit({ type: "search", query, maxPrice, found: res.products.length, channel3Error: res.channel3Error });
  emit({
    type: "results",
    products: res.products.map(({ productId, title, merchant, unitPrice, source }) => ({ productId, title, merchant, unitPrice, source })),
  });
  return res.products;
}

export async function toolReadPage(session: AgentSession, emit: Emit, productId: string) {
  const page = await readMerchantPage(productId);
  if (!page) return null;
  session.sourcesRead.push(page);
  emit({ type: "read_page", productId, url: page.url });
  return page;
}

/** How products are shown to the model: structured fields + untrusted text clearly fenced as data. */
export function productForModel(p: CatalogProduct) {
  return {
    productId: p.productId,
    title: p.title,
    merchant: p.merchant,
    price: `${p.unitPrice.value} ${p.unitPrice.currency}`,
    category: p.category,
    untrusted_description: `<untrusted_data>${p.description.slice(0, 600)}</untrusted_data>`,
  };
}
