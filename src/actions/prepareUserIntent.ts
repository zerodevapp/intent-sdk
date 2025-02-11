import {
  AccountNotFoundError,
  type KernelSmartAccountImplementation,
} from "@zerodev/sdk";
import type {
  Address,
  Chain,
  Client,
  ContractFunctionParameters,
  Hex,
  Transport,
} from "viem";
import { concatHex, encodeFunctionData } from "viem";
import type {
  PrepareUserOperationParameters,
  SmartAccount,
  UserOperationCall,
} from "viem/account-abstraction";
import { parseAccount } from "viem/utils";
import type { CombinedIntentRpcSchema } from "../client/intentClient.js";
import type { INTENT_VERSION_TYPE } from "../types/intent.js";
import type { GetIntentReturnType } from "./getIntent.js";
import { getIntent } from "./getIntent.js";

export type PrepareUserIntentParameters<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  calls extends readonly unknown[] = readonly unknown[],
> = PrepareUserOperationParameters<account, accountOverride, calls> & {
  inputTokens?: Array<{
    address: Hex;
    amount?: bigint;
    chainId: number;
  }>;
  outputTokens?: Array<{
    address: Hex;
    amount: bigint;
    chainId: number;
  }>;
  gasTokens?:
    | Array<{
        address: Hex;
        amount?: bigint;
        chainId: number;
      }>
    | "SPONSORED"
    | "NATIVE";
  chainId?: number;
};

export type PrepareUserIntentResult = GetIntentReturnType;

/**
 * Prepares a user intent for execution by converting it to a cross-chain order.
 *
 * @param client - Client to use
 * @param parameters - {@link PrepareUserIntentParameters}
 * @returns The prepared intent. {@link PrepareUserIntentResult}
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
 * // Using callData
 * const intent1 = await client.prepareUserIntent({
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
 *
 * // Using calls
 * const intent2 = await client.prepareUserIntent({
 *   calls: [{
 *     to: '0x...',
 *     value: 1000000n,
 *     data: '0x...'
 *   }],
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
export async function prepareUserIntent<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  chain extends Chain | undefined = Chain | undefined,
  accountOverride extends SmartAccount | undefined = undefined,
  calls extends readonly unknown[] = readonly unknown[],
>(
  client: Client<Transport, chain, account, CombinedIntentRpcSchema>,
  parameters: PrepareUserIntentParameters<account, accountOverride, calls>,
  version: INTENT_VERSION_TYPE,
): Promise<PrepareUserIntentResult> {
  const { account: account_ = client.account } = parameters;
  if (!account_) throw new AccountNotFoundError();

  const account = parseAccount(
    account_,
  ) as SmartAccount<KernelSmartAccountImplementation>;

  // Convert the user intent parameters to getIntent parameters
  const { inputTokens, outputTokens, chainId, gasTokens } = parameters;

  // Get callData from either direct callData or encoded calls
  const callData = await (async () => {
    if (parameters.calls)
      return account.encodeCalls(
        parameters.calls.map((call_: unknown) => {
          const call = call_ as
            | UserOperationCall
            | (ContractFunctionParameters & { to: Address; value: bigint });
          if ("abi" in call)
            return {
              data: encodeFunctionData(call),
              to: call.to,
              value: call.value,
            } as UserOperationCall;
          return call as UserOperationCall;
        }),
      );
    return parameters.callData ?? "0x";
  })();

  const factoryAddress = account.factoryAddress;
  const factoryData = await account.generateInitCode();
  const initData = concatHex([factoryAddress, factoryData]);

  // Call getIntent with the converted parameters
  return getIntent(
    client,
    {
      recipient: account.address,
      callData,
      inputTokens: inputTokens ?? [],
      outputTokens: outputTokens ?? [],
      gasTokens,
      chainId,
      initData,
    },
    version,
  );
}
