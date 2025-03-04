import type { Chain, Client, Transport } from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import type { CombinedIntentRpcSchema } from "../client/intentClient.js";
import { IntentVersionToAddressesMap } from "../config/constants.js";
import type { INTENT_VERSION_TYPE } from "../types/intent.js";
import type {
  GetUserIntentFillReceiptResult,
  GetUserIntentReceiptParameters,
} from "./types.js";

/**
 * Gets the execution receipt of a user intent.
 *
 * @param client - Client to use
 * @param parameters - {@link GetUserIntentReceiptParameters}
 * @returns The execution receipt of the user intent. {@link GetUserIntentFillReceiptResult}
 */
export async function getUserIntentFillReceipt<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
>(
  client: Client<transport, chain, account, CombinedIntentRpcSchema>,
  parameters: GetUserIntentReceiptParameters,
  version: INTENT_VERSION_TYPE,
): Promise<GetUserIntentFillReceiptResult> {
  const result = await client.request({
    method: "rl_getUserIntentFillReceipt",
    params: [
      parameters.uiHash,
      IntentVersionToAddressesMap[version].intentExecutorAddress,
    ],
  });

  return result as GetUserIntentFillReceiptResult;
}
