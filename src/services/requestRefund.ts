import { AxiosInstance } from "axios";
import { createNonceStr } from "../utils/nonce";
import { createTimestamp } from "../utils/timestamp";
import { signRequest } from "../utils/signature";
import { TelebirrMode, IntegrationOption } from "../config/telebirrConfig";
import {
  RefundInput,
  RefundResponse,
  TelebirrRefundRequest,
} from "../types/refund";

export async function requestRefund(
  client: AxiosInstance,
  fabricToken: string,
  input: RefundInput,
  config: {
    mode: TelebirrMode;
    merchantAppId: string;
    merchantCode: string;
    notifyUrl: string;
    redirectUrl: string;
    privateKey: string;
    http: boolean;
    integrationOption: IntegrationOption;
  }
): Promise<RefundResponse | void> {
  const req: TelebirrRefundRequest = {
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

  req.sign = signRequest(req, config.privateKey);
  req.sign_type = "SHA256WithRSA";

  try {
    const response = await client.post<RefundResponse>(
      "/payment/v1/merchant/refund",
      req,
      {
        headers: {
          Authorization: fabricToken,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
}
