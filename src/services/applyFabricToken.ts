import { AxiosInstance } from "axios";
import {
  ApplyFabricTokenRequest,
  FabricTokenResponse,
} from "../types/fabricToken";

export async function applyFabricToken(
  client: AxiosInstance,
  payload: ApplyFabricTokenRequest
): Promise<typeof FabricTokenResponse | void> {
  const appSecret = payload.appSecret;
  try {
    const response = await client.post<typeof FabricTokenResponse | void>(
      "/payment/v1/token",
      { appSecret }
    );

    return response.data;
  } catch (error) {
    console.log(error);
  }
}
