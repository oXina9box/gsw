import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export type SecretEnvelope = {
  ciphertext: string;
  iv: string;
  tag: string;
  keyVersion: string;
};

function decodeKey(value: string) {
  const key = Buffer.from(value, "base64");
  if (key.length !== 32) throw new Error("Secret encryption key must decode to 32-byte data");
  return key;
}

export function resolveSecretKey(
  keyVersion: string,
  currentVersion: string,
  currentKey: string,
  serializedKeyring = "{}",
) {
  if (keyVersion === currentVersion) {
    decodeKey(currentKey);
    return currentKey;
  }

  let keyring: unknown;
  try {
    keyring = JSON.parse(serializedKeyring);
  } catch {
    throw new Error("Provider secret keyring is invalid JSON");
  }
  if (!keyring || Array.isArray(keyring) || typeof keyring !== "object") {
    throw new Error("Provider secret keyring must be an object");
  }
  const key = (keyring as Record<string, unknown>)[keyVersion];
  if (typeof key !== "string") throw new Error(`Provider secret key ${keyVersion} is unavailable`);
  decodeKey(key);
  return key;
}

export function encryptSecret(value: string, encodedKey: string, keyVersion: string): SecretEnvelope {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", decodeKey(encodedKey), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    keyVersion,
  };
}

export function decryptSecret(envelope: SecretEnvelope, encodedKey: string) {
  const decipher = createDecipheriv("aes-256-gcm", decodeKey(encodedKey), Buffer.from(envelope.iv, "base64"));
  decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(envelope.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export function maskSecret(value: string) {
  return value.length > 4 ? `••••${value.slice(-4)}` : "••••";
}
