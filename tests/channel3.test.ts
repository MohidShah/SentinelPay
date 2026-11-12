import { describe, expect, it } from "vitest";
import { pickOffer, toCatalogProduct, type Channel3Product } from "@/lib/channel3/client";

const sample: Channel3Product = {
  id: "yQPi4N4",
  title: "W820NB Plus Wireless Noise-Canceling Headphones",
  description: "Hybrid ANC headphones.",
  category: { slug: "over-ear-headphones", path: [{ slug: "electronics" }] },
  key_features: ["Hybrid Active Noise Canceling (-49 dB)"],
  offers: [
    { url: "https://buy.example/a", domain: "pricey.example", price: { price: 79.99, currency: "USD" }, availability: "InStock" },
    { url: "https://buy.example/b", domain: "bhphotovideo.com", price: { price: 59.99, currency: "USD" }, availability: "InStock" },
    { url: "https://buy.example/c", domain: "cheap-but-gone.example", price: { price: 9.99, currency: "USD" }, availability: "OutOfStock" },
    { url: "https://buy.example/d", domain: "uk.example", price: { price: 5, currency: "GBP" }, availability: "InStock" },
  ],
};

describe("Channel3 mapping", () => {
  it("picks the cheapest available USD offer", () => {
    expect(pickOffer(sample)?.domain).toBe("bhphotovideo.com");
  });

  it("maps to a CatalogProduct with a slug-path category and 2-dp price", () => {
    const p = toCatalogProduct(sample)!;
    expect(p).toMatchObject({
      productId: "yQPi4N4",
      merchant: "bhphotovideo.com",
      category: "electronics/over-ear-headphones",
      unitPrice: { value: "59.99", currency: "USD" },
      isRecurring: false,
      source: "channel3",
    });
    expect(p.description).toContain("Hybrid Active Noise Canceling");
  });

  it("returns null when there is no USD offer", () => {
    expect(toCatalogProduct({ ...sample, offers: [] })).toBeNull();
  });

  it("flags subscription products as recurring", () => {
    expect(toCatalogProduct({ ...sample, title: "Audio Plus Membership (monthly)" })!.isRecurring).toBe(true);
  });
});
