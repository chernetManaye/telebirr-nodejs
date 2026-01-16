import http from "http";
import https from "https";
import { createNonceStr } from "../utils/nonce";
import { createTimestamp } from "../utils/timestamp";
import { signRequest } from "../utils/signature";
import { TelebirrMode } from "../types/telebirrConfig";
import {
  RefundInput,
  RefundResponse,
  TelebirrRefundRequest,
} from "../types/refund";
import { TELEBIRR_URLS } from "../constants/urls";

export function requestRefund(
  fabricToken: string,
  input: RefundInput,
  config: {
    mode: TelebirrMode;
    appId: string;
    merchantAppId: string;
    merchantCode: string;
    privateKey: string;
    http: boolean;
  }
): Promise<{
  data: RefundResponse;
  status: number;
  headers: http.IncomingHttpHeaders;
}> {
  const reqBody: TelebirrRefundRequest = {
    timestamp: createTimestamp(),
    nonce_str: createNonceStr(),
    method: "payment.refund",
    version: "1.0",
    biz_content: {
      appid: config.merchantAppId,
      merch_code: config.merchantCode,
      merch_order_id: input.merchOrderId,
      trans_currency: "ETB",
      actual_amount: input.amount,
      refund_request_no: input.refundRequestNo,
      refund_reason: input.refundReason,
    },
  };

  reqBody.sign = signRequest(reqBody, config.privateKey);
  reqBody.sign_type = "SHA256WithRSA";

  const payload = JSON.stringify(reqBody);

  const baseUrl = TELEBIRR_URLS[config.mode].apiBase;
  const isHttps = baseUrl.startsWith("https://");
  const client = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const req = client.request(
      `${baseUrl}/payment/v1/merchant/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          "X-APP-Key": config.appId,
          Authorization: fabricToken,
        },
        ...(isHttps && { rejectUnauthorized: false }),
      },
      (res) => {
        let raw = "";

        res.on("data", (chunk) => {
          raw += chunk;
        });

        res.on("end", () => {
          const status = res.statusCode || 0;
          let parsed: any = raw;

          try {
            parsed = JSON.parse(raw);
          } catch {
            // keep raw string if JSON parsing fails
          }

          if (status < 200 || status >= 300) {
            return reject({
              message: "Telebirr refund request failed",
              status,
              data: parsed,
              headers: res.headers,
            });
          }

          resolve({
            data: parsed,
            status,
            headers: res.headers,
          });
        });
      }
    );

    req.on("error", (err) => {
      reject({
        message: "Telebirr refund network error",
        cause: err,
        code: (err as any).code,
      });
    });

    req.write(payload);
    req.end();
  });
}
