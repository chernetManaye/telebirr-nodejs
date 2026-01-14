import { TelebirrMode } from "../config/telebirrConfig";
export interface ApplyFabricTokenRequest {
  appSecret: string;
  mode: TelebirrMode;
}

export interface ApplyFabricTokenResponse {
  token: string; // "Bearer xxxxx"
  effectiveDate: string; // yyyyMMddHHmmss
  expirationDate: string; // yyyyMMddHHmmss
}

export let FabricTokenResponse: ApplyFabricTokenResponse | undefined;
