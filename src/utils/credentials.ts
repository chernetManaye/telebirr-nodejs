import fs from "fs";
import path from "path";
import { randomUUID, randomBytes } from "crypto";
import { customAlphabet } from "nanoid";
import { generateKeys } from "./keys";

const numeric16 = customAlphabet("0123456789", 16);
const numeric6 = customAlphabet("0123456789", 6);

const ENV_FILE_NAME = ".env";

export function generateCredentials(): void {
  const envPath = path.join(process.cwd(), ENV_FILE_NAME);

  const existingEnv = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf8")
    : "";

  // Collect existing keys
  const existingKeys = new Set(
    existingEnv
      .split("\n")
      .map((line) => line.split("=")[0].trim())
      .filter(Boolean)
  );

  const entries: string[] = [];

  // Helper
  const addIfMissing = (key: string, value: string) => {
    if (!existingKeys.has(key)) {
      entries.push(`${key}=${value}`);
    }
  };

  // Generate key only if needed
  let merchantPrivateKey = "";
  if (!existingKeys.has("MERCHANT_PRIVATE_KEY")) {
    const { privateKeyPath } = generateKeys();
    merchantPrivateKey = fs
      .readFileSync(privateKeyPath, "utf8")
      .replace(/\n/g, "\\n");
  }

  addIfMissing("FABRIC_APP_ID", process.env.FABRIC_APP_ID ?? randomUUID());

  addIfMissing(
    "FABRIC_APP_SECRET",
    process.env.FABRIC_APP_SECRET ?? randomBytes(16).toString("hex")
  );

  addIfMissing("MERCHANT_APP_ID", process.env.MERCHANT_APP_ID ?? numeric16());

  addIfMissing("MERCHANT_CODE", process.env.MERCHANT_CODE ?? numeric6());

  if (merchantPrivateKey) {
    addIfMissing("MERCHANT_PRIVATE_KEY", `"${merchantPrivateKey}"`);
  }

  // Nothing to write
  if (entries.length === 0) {
    return;
  }

  const header =
    existingEnv.trim().length === 0
      ? "# Telebirr Credentials\n"
      : "\n\n# Telebirr Credentials\n";

  fs.writeFileSync(
    envPath,
    existingEnv + header + entries.join("\n") + "\n",
    "utf8"
  );
}
