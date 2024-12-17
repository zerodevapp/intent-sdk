import type { Chain, Client, Hex, Transport } from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import type { CombinedIntentRpcSchema } from "../client/intentClient.js";

export type UserIntentStatus = "NOT_FOUND" | "PENDING" | "OPENED" | "EXECUTED";

export type Transaction = {
  chainId: number;
  txHash: Hex;
};

export type GetUserIntentStatusParameters = {
  uiHash: Hex;
};

export type GetUserIntentStatusResult = {
  status: UserIntentStatus;
  openTransaction?: Transaction;
  executionTransaction?: Transaction;
};

/**
 * Gets the status of a user intent.
 *
 * @param client - Client to use
 * @param parameters - {@link GetUserIntentStatusParameters}
 * @returns The status of the user intent. {@link GetUserIntentStatusResult}
 *
 * @example
 * import { createIntentClient, http } from '@zerodev/intent'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createIntentClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const status = await client.getUserIntentStatus({ uiHash: "0x..." })
 */
export async function getUserIntentStatus<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
>(
  client: Client<transport, chain, account, CombinedIntentRpcSchema>,
  parameters: GetUserIntentStatusParameters,
): Promise<GetUserIntentStatusResult> {
  const result = await client.request({
    method: "rl_getUserIntentStatus",
    params: [parameters.uiHash],
  });

  return result as GetUserIntentStatusResult;
}
