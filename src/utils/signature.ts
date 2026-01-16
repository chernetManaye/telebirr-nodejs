import crypto from "crypto";

function flattenParams(params: Record<string, any>): Record<string, string> {
  const flat: Record<string, string> = {};

  for (const key in params) {
    const value = params[key];

    if (
      value === undefined ||
      value === null ||
      value === "" ||
      key === "sign" ||
      key === "signType" ||
      key === "sign_type"
    ) {
      continue;
    }

    if (key === "biz_content" && typeof value === "object") {
      for (const bizKey in value) {
        const bizValue = value[bizKey];
        if (bizValue !== undefined && bizValue !== null && bizValue !== "") {
          flat[bizKey] = String(bizValue);
        }
      }
    } else {
      flat[key] = String(value);
    }
  }

  return flat;
}

export function buildSignString(params: Record<string, any>): string {
  const flat = flattenParams(params);

  return Object.keys(flat)
    .sort()
    .map((key) => `${key}=${flat[key]}`)
    .join("&");
}

export function signRequest(
  data: Record<string, any>,
  privateKey: string
): string {
  const signString = buildSignString(data);

  return crypto
    .createSign("RSA-SHA256")
    .update(signString, "utf8")
    .sign(privateKey, "base64");
}
