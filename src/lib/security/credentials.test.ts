import { beforeAll, describe, expect, it } from "vitest";
import { decryptCredential, encryptCredential } from "./credentials";

describe("credential encryption", () => {
  beforeAll(() => {
    process.env.CREDENTIAL_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  });

  it("round-trips without exposing plaintext", () => {
    const encrypted = encryptCredential("canvas-secret");
    expect(encrypted).not.toContain("canvas-secret");
    expect(decryptCredential(encrypted)).toBe("canvas-secret");
  });

  it("uses a unique nonce for each encryption", () => {
    expect(encryptCredential("same-value")).not.toBe(encryptCredential("same-value"));
  });

  it("rejects tampered ciphertext", () => {
    const encrypted = encryptCredential("canvas-secret");
    const parts = encrypted.split(".");
    const ciphertext = Buffer.from(parts[2], "base64url");
    ciphertext[0] ^= 1;
    parts[2] = ciphertext.toString("base64url");
    expect(() => decryptCredential(parts.join("."))).toThrow();
  });
});
