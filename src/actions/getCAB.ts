import type { Chain, Client, Hex, Transport } from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import type { CombinedIntentRpcSchema } from "../client/intentClient.js";

export type TokenBreakdown = {
  chainId: number;
  address: Hex;
  amount: Hex;
};

export type TokenBalance = {
  ticker: string;
  amount: Hex;
  decimal: number;
  breakdown: TokenBreakdown[];
};

export type GetCABParameters = {
  accountAddress: Hex;
  tokenTickers?: string[];
};

export type GetCABResult = {
  tokens: TokenBalance[];
};

/**
 * Gets Current Account Balances (CAB) for a specified account address.
 *
 * @param client - Client to use
 * @param parameters - {@link GetCABParameters}
 * @returns The account balances. {@link GetCABResult}
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
 * const balances = await client.getCAB({
 *   accountAddress: "0x...",
 *   tokenTickers: ["ETH", "USDC"]
 * })
 */
export async function getCAB<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
>(
  client: Client<transport, chain, account, CombinedIntentRpcSchema>,
  parameters: GetCABParameters,
): Promise<GetCABResult> {
  const result = await client.request({
    method: "ui_getCAB",
    params: [parameters],
  });

  return result as GetCABResult;
} 