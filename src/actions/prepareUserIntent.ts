import type { CabClient } from "../client/cabClient.js";
import type {
  PrepareUserIntentParameters,
  PrepareUserIntentResult,
} from "../types/actions.js";
import { getIntent } from "./getIntent.js";

/**
 * Prepares a user intent for execution by converting it to a cross-chain order.
 *
 * @param client - Client to use
 * @param parameters - {@link PrepareUserIntentParameters}
 * @returns The prepared intent. {@link PrepareUserIntentResult}
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
 * const intent = await client.prepareUserIntent({
 *   to: '0x...',
 *   value: 1000000n,
 *   data: '0x...',
 * })
 */
export async function prepareUserIntent(
  client: CabClient,
  parameters: PrepareUserIntentParameters
): Promise<PrepareUserIntentResult> {
  // Convert the user intent parameters to getIntent parameters
  const { to, value, data } = parameters;

  // Call getIntent with the converted parameters
  return getIntent(client, {
    recipient: to,
    callData: data,
    inputTokens: [
      {
        address: to,
        amount: value,
        chainId: BigInt(client.chain?.id ?? 1),
      },
    ],
    outputTokens: [
      {
        address: to,
        amount: value,
        chainId: BigInt(client.chain?.id ?? 1),
      },
    ],
  });
}
