import { getMockProduct } from "@/fixtures/merchants";
import type { GateDeps } from "@/lib/gate/evaluate";
import type { CatalogProduct, Mandate, ProposedCart } from "@/lib/types";

export const NOW = new Date("2026-11-10T12:00:00Z");

export function makeMandate(over: Partial<Mandate> = {}): Mandate {
  return {
    id: "m_test",
    userPrompt: "Buy me noise-canceling headphones under $150, rated well, no subscriptions.",
    maxTotal: { value: "150.00", currency: "USD" },
    allowedCategories: ["electronics/headphones"],
    maxQuantity: 1,
    allowRecurring: false,
    expiresAt: new Date(NOW.getTime() + 2 * 3600_000).toISOString(),
    status: "ACTIVE",
    signature: "sig",
    createdAt: NOW.toISOString(),
    ...over,
  };
}

/** Cart that honestly mirrors the catalog record for `productId`. */
export function cartFor(productId: string, over: Partial<ProposedCart> = {}): ProposedCart {
  const p = getMockProduct(productId) ?? EXTRA[productId];
  if (!p) throw new Error(`unknown product ${productId}`);
  return {
    mandateId: "m_test",
    items: [
      {
        productId: p.productId,
        title: p.title,
        merchant: p.merchant,
        category: p.category,
        unitPrice: p.unitPrice,
        quantity: 1,
        isRecurring: p.isRecurring,
      },
    ],
    extraFees: [],
    agentReasoning: "Best match under budget.",
    sourcesRead: [],
    ...over,
  };
}

/** Extra catalog entries for tests that the demo fixtures don't cover. */
export const EXTRA: Record<string, CatalogProduct> = {
  c3_expensive: {
    productId: "c3_expensive",
    title: "Studio Max Headphones",
    merchant: "bigbox.example",
    category: "electronics/over-ear-headphones",
    unitPrice: { value: "349.99", currency: "USD" },
    isRecurring: false,
    url: "https://bigbox.example/studio-max",
    description: "Flagship over-ear headphones.",
    source: "channel3",
  },
  c3_subscription: {
    productId: "c3_subscription",
    title: "SoundClub Premium Audio",
    merchant: "soundclub.example",
    category: "electronics/over-ear-headphones",
    unitPrice: { value: "9.99", currency: "USD" },
    isRecurring: true,
    url: "https://soundclub.example/premium",
    description: "Monthly headphone rental membership.",
    source: "channel3",
  },
  c3_laptop: {
    productId: "c3_laptop",
    title: "Budget Laptop",
    merchant: "bigbox.example",
    category: "electronics/laptops",
    unitPrice: { value: "99.00", currency: "USD" },
    isRecurring: false,
    url: "https://bigbox.example/laptop",
    description: "A laptop.",
    source: "channel3",
  },
};

export function deps(mandate: Mandate | null = makeMandate(), signatureValid = true): GateDeps {
  return {
    getMandate: async (id) => (mandate && mandate.id === id ? mandate : null),
    verifyMandate: () => signatureValid,
    resolveProduct: async (id) => {
      const p = getMockProduct(id) ?? EXTRA[id];
      if (!p) return null;
      // Return a plain CatalogProduct (strip the page html).
      const { ...rest } = p as CatalogProduct & { page?: string };
      delete rest.page;
      return rest;
    },
    now: () => NOW,
  };
}
