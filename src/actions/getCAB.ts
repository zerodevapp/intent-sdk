import { AccountNotFoundError } from "@zerodev/sdk";
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
  account?: SmartAccount;
  accountAddress?: Hex;
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
 * // Get balances for connected account on mainnet networks
 * const balances1 = await client.getCAB({
 *   networkType: "mainnet"
 * })
 *
 * // Get specific tokens for specific address on specific networks
 * const balances2 = await client.getCAB({
 *   accountAddress: "0x...",
 *   tokenTickers: ["ETH", "USDC"],
 *   networks: [1, 137]  // Ethereum mainnet and Polygon
 * })
 *
 * // Get all tokens for connected account on testnet networks
 * const balances3 = await client.getCAB({
 *   networkType: "testnet"
 * })
 *
 * // Get balances using a specific account
 * const balances4 = await client.getCAB({
 *   account: kernelAccount,
 *   networkType: "testnet"
 * })
 *
 * @throws {Error} If no account is connected and no accountAddress or account is provided
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
  const { account: account_ = client.account } = parameters;
  const accountAddress = parameters.accountAddress ?? account_?.address;
  if (!accountAddress) throw new AccountNotFoundError();

  const result = await client.request({
    method: "ui_getCAB",
    params: [{ ...parameters, accountAddress }],
  });

  return result as GetCABResult;
}
