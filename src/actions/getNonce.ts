import { AccountNotFoundError } from "@zerodev/sdk";
import type { Address, Chain, Client, Transport } from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import { multicall } from "viem/actions";
import { getAction } from "viem/utils";
import type { CombinedIntentRpcSchema } from "../client/intentClient.js";
import {
  INTENT_V0_4,
  IntentVersionToAddressesMap,
} from "../config/constants.js";
import type { INTENT_VERSION_TYPE } from "../types/intent.js";

export type GetNonceParameters = {
  nonceKey: bigint;
  account?: Address;
};

export type GetNonceResult = {
  paymentNonce: bigint;
  executionNonce: bigint;
};

/**
 * Get the payment and execution nonces associated to the nonceKey for the account.
 *
 * @param client - Client to use
 * @param parameters - {@link GetNonceParameters}
 * @param version - {@link INTENT_VERSION_TYPE}
 * @returns The payment and execution nonces. {@link GetNonceResult}
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
 * const nonce = await client.getNonce({
 *   nonceKey: 0n,
 * })
 */
export async function getNonce<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
>(
  client: Client<transport, chain, account, CombinedIntentRpcSchema>,
  parameters: GetNonceParameters,
  version: INTENT_VERSION_TYPE,
): Promise<GetNonceResult> {
  const { nonceKey } = parameters;
  const accountAddress = parameters.account || client.account?.address;
  if (!accountAddress) throw new AccountNotFoundError();

  if (version !== INTENT_V0_4)
    throw new Error(`2nd nonce not supported for intent version ${version}`);

  const [paymentNonce, executionNonce] = await getAction(
    client,
    multicall,
    "multicall",
  )({
    contracts: [
      {
        address: IntentVersionToAddressesMap[version].intentExecutorAddress,
        abi: [
          {
            inputs: [
              {
                name: "sender",
                type: "address",
              },
              {
                name: "key",
                type: "uint160",
              },
            ],
            name: "paymentNonce",
            outputs: [
              {
                name: "nonce",
                type: "uint256",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "paymentNonce",
        args: [accountAddress, nonceKey],
      },
      {
        address: IntentVersionToAddressesMap[version].intentExecutorAddress,
        abi: [
          {
            inputs: [
              {
                name: "sender",
                type: "address",
              },
              {
                name: "key",
                type: "uint160",
              },
            ],
            name: "executionNonce",
            outputs: [
              {
                name: "nonce",
                type: "uint256",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "executionNonce",
        args: [accountAddress, nonceKey],
      },
    ],
    allowFailure: false,
  });
  return {
    paymentNonce: paymentNonce,
    executionNonce: executionNonce,
  };
}
