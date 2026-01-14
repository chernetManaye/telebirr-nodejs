import { randomUUID, randomBytes } from "crypto";
import { Sonyflake } from "sonyflake";
import { customAlphabet } from "nanoid";
import fs from "fs";
import path from "path";

import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sf = new Sonyflake();
const generateMerchantCode = customAlphabet("0123456789", 6);

export interface SimulatorCredentials {
  fabricAppId: string;
  fabricAppSecret: string;
  merchantAppId: string;
  merchantCode: string;
  merchantPrivateKey: string;
}

export function generateCredentials(
  merchantPrivateKey: string
): SimulatorCredentials {
  return {
    fabricAppId: randomUUID(),
    fabricAppSecret: randomBytes(16).toString("hex"),
    merchantAppId: sf.nextId().toString(),
    merchantCode: generateMerchantCode(),
    merchantPrivateKey,
  };
}
