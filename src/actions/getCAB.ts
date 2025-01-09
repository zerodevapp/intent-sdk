import type { Chain, Client, Hex, Transport } from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import type { CombinedIntentRpcSchema } from "../client/intentClient.js";

export type NetworkType = "mainnet" | "testnet";

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

type BaseCABParameters = {
  accountAddress: Hex;
  tokenTickers?: string[];
};

type NetworkFilterParameters = BaseCABParameters & {
  networks: number[];
  networkType?: never;
};

type NetworkTypeParameters = BaseCABParameters & {
  networks?: never;
  networkType?: NetworkType;
};

export type GetCABParameters = NetworkFilterParameters | NetworkTypeParameters;

export type GetCABResult = {
  tokens: TokenBalance[];
};

/**
 * Gets Consolidated Account Balances (CAB) for a specified account address.
 * Returns token balances across supported chains with optional filtering by networks and tokens.
 *
 * @param client - Client to use
 * @param parameters - {@link GetCABParameters}
 * @returns The consolidated account balances. {@link GetCABResult}
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
 * // Get all balances on mainnet networks
 * const balances1 = await client.getCAB({
 *   accountAddress: "0x...",
 *   networkType: "mainnet"
 * })
 *
 * // Get specific tokens on specific networks
 * const balances2 = await client.getCAB({
 *   accountAddress: "0x...",
 *   tokenTickers: ["ETH", "USDC"],
 *   networks: [1, 137]  // Ethereum mainnet and Polygon
 * })
 *
 * // Get all tokens on testnet networks
 * const balances3 = await client.getCAB({
 *   accountAddress: "0x...",
 *   networkType: "testnet"
 * })
 *
 * @throws {Error} If mixing mainnet and testnet networks when using networks parameter
 * @throws {Error} If any specified network is unsupported
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
