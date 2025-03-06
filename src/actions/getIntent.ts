import type { Chain, Client, Hex, RpcErrorType, Transport } from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import type { CombinedIntentRpcSchema } from "../client/intentClient.js";
import type { INTENT_VERSION_TYPE } from "../types/intent.js";
import { deepHexlify } from "../utils/deepHexlify.js";

export type GetIntentParameters = {
  recipient: Hex;
  callData: Hex;
  inputTokens: Array<{
    address: Hex;
    amount?: bigint;
    chainId: number;
  }>;
  outputTokens: Array<{
    address: Hex;
    amount: bigint;
    chainId: number;
  }>;
  initData?: Hex | undefined;
  // same-chain
  gasToken?: "SPONSORED" | "NATIVE";
  chainId?: number;
};

// The actual order type
export type GaslessCrossChainOrder = {
  originSettler: Hex;
  user: Hex;
  nonce: bigint;
  originChainId: bigint;
  openDeadline: number;
  fillDeadline: number;
  orderDataType: Hex;
  orderData: Hex;
};

// Return type alias for the getIntent action
export type GetIntentReturnType = {
  orders: Array<GaslessCrossChainOrder>;
};

export type GetIntentErrorType = RpcErrorType;

/**
 * Gets the intent for a cross-chain transaction.
 *
 * @param client - Client to use
 * @param parameters - {@link GetIntentParameters}
 * @returns The intent. {@link GetIntentReturnType}
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
 * const intent = await client.getIntent({
 *   recipient: '0x...',
 *   callData: '0x...',
 *   inputTokens: [{
 *     address: '0x...',
 *     amount: 1000000n,
 *     chainId: 1n
 *   }],
 *   outputTokens: [{
 *     address: '0x...',
 *     amount: 900000n,
 *     chainId: 10n
 *   }]
 * })
 */
export async function getIntent<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
>(
  client: Client<transport, chain, account, CombinedIntentRpcSchema>,
  parameters: GetIntentParameters,
  version: INTENT_VERSION_TYPE,
): Promise<GetIntentReturnType> {
  const { gasToken, ...rest } = parameters;
  const parametersWithVersion = {
    ...rest,
    gasTokens: gasToken,
    version,
  };
  const intent = (await client.request({
    method: "ui_getIntent",
    params: [deepHexlify(parametersWithVersion)],
  })) as GetIntentReturnType;

  return intent;
}
