import type { Chain, Client, Transport } from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import type { CabRpcSchema } from "../client/cabClient.js";
import type {
  GetUserIntentReceiptParameters,
  GetUserIntentReceiptResult,
} from "./types.js";

/**
 * Gets the open receipt of a user intent.
 *
 * @param client - Client to use
 * @param parameters - {@link GetUserIntentReceiptParameters}
 * @returns The open receipt of the user intent. {@link GetUserIntentReceiptResult}
 */
export async function getUserIntentOpenReceipt<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
>(
  client: Client<transport, chain, account, CabRpcSchema>,
  parameters: GetUserIntentReceiptParameters,
): Promise<GetUserIntentReceiptResult> {
  const result = await client.request({
    method: "rl_getUserIntentOpenReceipt",
    params: [parameters.uiHash],
  });

  return result as GetUserIntentReceiptResult;
}
