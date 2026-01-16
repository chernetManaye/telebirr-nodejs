import { randomBytes } from "crypto";

export function createNonceStr(): string {
  const bytes = Math.ceil(16);
  return randomBytes(bytes).toString("hex").slice(0, 32);
}
