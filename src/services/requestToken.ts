import http from "http";
import https from "https";
import { TELEBIRR_URLS } from "../constants/urls";
import { TelebirrConfig } from "../types/telebirrConfig";

export function requestToken(config: TelebirrConfig) {
  const isHttps = TELEBIRR_URLS[config.mode].apiBase.startsWith("https://");
  const client = isHttps ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.request(
      ` ${TELEBIRR_URLS[config.mode].apiBase}/payment/v1/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-APP-Key": config.appId,
        },
        ...(isHttps && { rejectUnauthorized: false }),
      },
      (res) => {
        let body = "";

        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(body));
      }
    );

    req.on("error", reject);
    req.write(JSON.stringify({ appSecret: config.appSecret }));
    req.end();
  });
}

// import { AxiosInstance } from "axios";
// import {
//   ApplyFabricTokenRequest,
//   FabricTokenResponse,
// } from "../types/fabricToken";

// export async function applyFabricToken(
//   client: AxiosInstance,
//   payload: ApplyFabricTokenRequest
// ): Promise<typeof FabricTokenResponse | void> {
//   const appSecret = payload.appSecret;
//   try {
//     const response = await client.post<typeof FabricTokenResponse | void>(
//       "/payment/v1/token",
//       { appSecret }
//     );

//     return response.data;
//   } catch (error) {
//     console.log(error);
//   }
// }
