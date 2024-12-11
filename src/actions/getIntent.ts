import type { Chain, Client, Hex, RpcErrorType, Transport } from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import type { CabRpcSchema } from "../client/cabClient.js";
import { deepHexlify } from "../utils/deepHexlify.js";

export type GetIntentParameters = {
  recipient: Hex;
  callData: Hex;
  inputTokens: Array<{
    address: Hex;
    amount: bigint;
    chainId: number;
  }>;
  outputTokens: Array<{
    address: Hex;
    amount: bigint;
    chainId: number;
  }>;
  initData?: Hex | undefined;
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
  order: GaslessCrossChainOrder;
  fillerData: Hex;
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
export async function getIntent<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined
>(
  client: Client<transport, chain, account, CabRpcSchema>,
  parameters: GetIntentParameters
): Promise<GetIntentReturnType> {
  const intent = (await client.request({
    method: "ui_getIntent",
    params: [deepHexlify(parameters)],
  })) as GetIntentReturnType;

  return intent;
}
