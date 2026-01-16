import fs from "fs";
import { randomUUID, randomBytes } from "crypto";
import { customAlphabet } from "nanoid";
import { generateKeys } from "./keys";

const numeric16 = customAlphabet("0123456789", 16);
const numeric6 = customAlphabet("0123456789", 6);

export interface SimulatorCredentials {
  fabricAppId: string;
  fabricAppSecret: string;
  merchantAppId: string;
  merchantCode: string;
  merchantPrivateKey: string;
}

export function generateCredentials(): SimulatorCredentials {
  const { privateKeyPath } = generateKeys();

  const merchantPrivateKey = fs.readFileSync(privateKeyPath, "utf8");

  return {
    fabricAppId: randomUUID(),
    fabricAppSecret: randomBytes(16).toString("hex"),
    merchantAppId: numeric16(),
    merchantCode: numeric6(),
    merchantPrivateKey,
  };
}
