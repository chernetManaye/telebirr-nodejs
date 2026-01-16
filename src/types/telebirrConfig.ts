export type TelebirrMode = "simulate" | "sandbox" | "production";
export interface TelebirrConfig {
  appId: string;
  appSecret: string;
  merchantAppId: string;
  merchantCode: string;
  privateKey: string;
  notifyUrl: string;
  redirectUrl: string;
  mode: TelebirrMode;
  http: boolean;
}
