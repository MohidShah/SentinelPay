import { generateKeyPairSync } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { canonicalize } from "@/lib/crypto/canonical";
import { _setSigningKeyForTests, signPayload, verifyPayload } from "@/lib/crypto/sign";

beforeAll(() => {
  _setSigningKeyForTests(generateKeyPairSync("ed25519").privateKey);
});

describe("canonicalize", () => {
  it("sorts keys recursively and drops undefined", () => {
    expect(canonicalize({ b: 1, a: { d: 2, c: undefined, b: [3, { z: 1, y: 2 }] } })).toBe(
      '{"a":{"b":[3,{"y":2,"z":1}],"d":2},"b":1}',
    );
  });

  it("is insensitive to key order", () => {
    expect(canonicalize({ x: 1, y: 2 })).toBe(canonicalize({ y: 2, x: 1 }));
  });
});

describe("Ed25519 signing", () => {
  const mandate = { id: "m_1", maxTotal: { value: "150.00", currency: "USD" }, allowRecurring: false };

  it("verifies an untouched payload", () => {
    const { signature, hash } = signPayload(mandate);
    expect(verifyPayload(mandate, signature, hash).valid).toBe(true);
  });

  it("verifies regardless of key order", () => {
    const { signature } = signPayload(mandate);
    const reordered = { allowRecurring: false, maxTotal: { currency: "USD", value: "150.00" }, id: "m_1" };
    expect(verifyPayload(reordered, signature).valid).toBe(true);
  });

  it("fails when the payload is tampered with", () => {
    const { signature, hash } = signPayload(mandate);
    const tampered = { ...mandate, maxTotal: { value: "1500.00", currency: "USD" } };
    const res = verifyPayload(tampered, signature, hash);
    expect(res.valid).toBe(false);
    expect(res.reason).toMatch(/modified/);
    expect(verifyPayload(tampered, signature).valid).toBe(false);
  });

  it("fails on a garbage signature", () => {
    expect(verifyPayload(mandate, "not-a-signature").valid).toBe(false);
  });
});
