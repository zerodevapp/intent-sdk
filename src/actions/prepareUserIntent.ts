import type {
  Chain,
  Client,
  Transport,
  Address,
  ContractFunctionParameters,
  Hex,
} from "viem";
import type {
  SmartAccount,
  UserOperationCall,
  PrepareUserOperationParameters,
} from "viem/account-abstraction";
import { parseAccount } from "viem/utils";
import { AccountNotFoundError } from "@zerodev/sdk";
import { concatHex, encodeFunctionData } from "viem";
import type { CabRpcSchema } from "../client/cabClient.js";
import type { GetIntentReturnType } from "./getIntent.js";
import { getIntent } from "./getIntent.js";

export type PrepareUserIntentParameters<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  calls extends readonly unknown[] = readonly unknown[]
> = PrepareUserOperationParameters<account, accountOverride, calls> & {
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
 * import { createCabClient, http } from '@zerodev/cab-sdk'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createCabClient({
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
  calls extends readonly unknown[] = readonly unknown[]
>(
  client: Client<Transport, chain, account, CabRpcSchema>,
  parameters: PrepareUserIntentParameters<account, accountOverride, calls>
): Promise<PrepareUserIntentResult> {
  const { account: account_ = client.account } = parameters;
  if (!account_) throw new AccountNotFoundError();

  const account = parseAccount(account_);

  // Convert the user intent parameters to getIntent parameters
  const { inputTokens, outputTokens } = parameters;

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
        })
      );
    return parameters.callData ?? "0x";
  })();

  const { factory, factoryData } = await account.getFactoryArgs();
  const initData =
    factory && factoryData ? concatHex([factory, factoryData]) : undefined;

  // Call getIntent with the converted parameters
  return getIntent(client, {
    recipient: account.address,
    callData,
    inputTokens,
    outputTokens,
    initData,
  });
}
