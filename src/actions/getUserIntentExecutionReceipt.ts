import type { Chain, Client, Transport } from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import type { CombinedIntentRpcSchema } from "../client/intentClient.js";
import type {
  GetUserIntentReceiptParameters,
  GetUserIntentReceiptResult,
} from "./types.js";

/**
 * Gets the execution receipt of a user intent.
 *
 * @param client - Client to use
 * @param parameters - {@link GetUserIntentReceiptParameters}
 * @returns The execution receipt of the user intent. {@link GetUserIntentReceiptResult}
 */
export async function getUserIntentExecutionReceipt<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
>(
  client: Client<transport, chain, account, CombinedIntentRpcSchema>,
  parameters: GetUserIntentReceiptParameters,
): Promise<GetUserIntentReceiptResult> {
  const result = await client.request({
    method: "rl_getUserIntentExecutionReceipt",
    params: [parameters.uiHash],
  });

  return result as GetUserIntentReceiptResult;
}
