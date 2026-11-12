import {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  sign as edSign,
  verify as edVerify,
  type KeyObject,
} from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { canonicalize, sha256Hex } from "./canonical";

/**
 * Ed25519 signing service.
 * Key source, in order: SIGNING_PRIVATE_KEY (base64 of a PKCS#8 PEM) → ./keys/signing.pem
 * (gitignored) → generate one and save it to ./keys/signing.pem.
 */

const KEY_FILE = path.join(process.cwd(), "keys", "signing.pem");

let cachedKey: KeyObject | undefined;

function loadPrivateKey(): KeyObject {
  if (cachedKey) return cachedKey;

  const fromEnv = process.env.SIGNING_PRIVATE_KEY?.trim();
  if (fromEnv) {
    cachedKey = createPrivateKey(Buffer.from(fromEnv, "base64").toString("utf8"));
  } else if (fs.existsSync(KEY_FILE)) {
    cachedKey = createPrivateKey(fs.readFileSync(KEY_FILE, "utf8"));
  } else {
    const { privateKey } = generateKeyPairSync("ed25519");
    fs.mkdirSync(path.dirname(KEY_FILE), { recursive: true });
    fs.writeFileSync(KEY_FILE, privateKey.export({ type: "pkcs8", format: "pem" }), { mode: 0o600 });
    cachedKey = privateKey;
  }
  if (cachedKey.asymmetricKeyType !== "ed25519") {
    throw new Error("SIGNING_PRIVATE_KEY must be an Ed25519 key");
  }
  return cachedKey;
}

/** Override the key (tests). */
export function _setSigningKeyForTests(key: KeyObject | undefined) {
  cachedKey = key;
}

export function publicKeyPem(): string {
  return createPublicKey(loadPrivateKey()).export({ type: "spki", format: "pem" }).toString();
}

export type Signed = { hash: string; signature: string };

/** canonical JSON → sha256 → Ed25519 signature over the hash (hex in, base64 out). */
export function signPayload(payload: unknown): Signed {
  const hash = sha256Hex(canonicalize(payload));
  const signature = edSign(null, Buffer.from(hash, "utf8"), loadPrivateKey()).toString("base64");
  return { hash, signature };
}

export type VerifyResult = { valid: boolean; hash: string; reason?: string };

export function verifyPayload(payload: unknown, signature: string, expectedHash?: string): VerifyResult {
  const hash = sha256Hex(canonicalize(payload));
  if (expectedHash && expectedHash !== hash) {
    return { valid: false, hash, reason: "Content hash does not match the recorded hash (payload was modified)" };
  }
  try {
    const ok = edVerify(
      null,
      Buffer.from(hash, "utf8"),
      createPublicKey(loadPrivateKey()),
      Buffer.from(signature, "base64"),
    );
    return ok ? { valid: true, hash } : { valid: false, hash, reason: "Signature does not match payload" };
  } catch {
    return { valid: false, hash, reason: "Malformed signature" };
  }
}
