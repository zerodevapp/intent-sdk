import type { RpcErrorType } from "viem";
import type { CabClient } from "../client/cabClient.js";

export type GetIntentParameters = {
  recipient: `0x${string}`;
  callData: `0x${string}`;
  inputTokens: Array<{
    address: `0x${string}`;
    amount: bigint;
    chainId: bigint;
  }>;
  outputTokens: Array<{
    address: `0x${string}`;
    amount: bigint;
    chainId: bigint;
  }>;
};

// The actual order type
export type GaslessCrossChainOrder = {
  originSettler: `0x${string}`;
  user: `0x${string}`;
  nonce: bigint;
  originChainId: bigint;
  openDeadline: number;
  fillDeadline: number;
  orderDataType: `0x${string}`;
  orderData: `0x${string}`;
};

// Return type alias for the getIntent action
export type GetIntentReturnType = GaslessCrossChainOrder;

export type GetIntentErrorType = RpcErrorType;

/**
 * Gets the intent for a cross-chain transaction.
 *
 * @param client - Client to use
 * @param parameters - {@link GetIntentParameters}
 * @returns The intent. {@link GetIntentReturnType}
 *
 * @example
 * import { createCabClient, http } from '@zerodev/cab-sdk'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createCabClient({
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
export async function getIntent(
  client: CabClient,
  parameters: GetIntentParameters,
): Promise<GetIntentReturnType> {
  const intent = (await client.request({
    method: "ui_getIntent",
    params: [parameters],
  })) as GetIntentReturnType;

  return intent;
}
