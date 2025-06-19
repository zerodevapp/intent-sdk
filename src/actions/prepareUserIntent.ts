import {
  AccountNotFoundError,
  type KernelSmartAccountImplementation,
} from "@zerodev/sdk";
import type {
  Address,
  Call,
  Chain,
  Client,
  ContractFunctionParameters,
  Hex,
  SignedAuthorization,
  Transport,
} from "viem";
import { concat, concatHex, encodeFunctionData } from "viem";
import type {
  PrepareUserOperationParameters,
  SmartAccount,
} from "viem/account-abstraction";
import { parseAccount } from "viem/utils";
import type { CombinedIntentRpcSchema } from "../client/intentClient.js";
import type { GAS_TOKEN_TYPE, INTENT_VERSION_TYPE } from "../types/intent.js";
import {
  get7702InitCalls,
  getAuthorization,
} from "../utils/getAuthorizationList.js";
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
  gasToken?: GAS_TOKEN_TYPE;
  chainId?: number;
  // 2d nonce
  nonceKey?: bigint;
  // 7702
  authorizationList?: SignedAuthorization[];
  initCalls7702?: Call[];
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
  const {
    account: account_ = client.account,
    authorizationList: authorizationList_,
    initCalls7702: initCalls7702_,
  } = parameters;
  if (!account_) throw new AccountNotFoundError();

  const account = parseAccount(
    account_,
  ) as SmartAccount<KernelSmartAccountImplementation>;

  // Convert the user intent parameters to getIntent parameters
  const { inputTokens, outputTokens, chainId, gasToken, nonceKey } = parameters;

  // Get callData from either direct callData or encoded calls
  const callData = await (async () => {
    if (parameters.calls)
      return account.encodeCalls(
        parameters.calls.map((call_: unknown) => {
          const call = call_ as
            | Call
            | (ContractFunctionParameters & { to: Address; value: bigint });
          if ("abi" in call)
            return {
              data: encodeFunctionData(call as ContractFunctionParameters),
              to: call.to,
              value: call.value,
            } as Call;
          return call as Call;
        }),
      );
    return parameters.callData ?? "0x";
  })();

  const isEip7702 = account.eip7702Authorization;
  const implementation = account.accountImplementationAddress;
  const factoryAddress = account.factoryAddress;
  const factoryData = await account.generateInitCode();
  const initData = concatHex([factoryAddress, factoryData]);

  // get authorization list and init call for 7702 on destination chain
  const destinationChainId =
    outputTokens && outputTokens.length > 0 ? outputTokens[0].chainId : chainId;
  const authorization = authorizationList_
    ? undefined
    : await getAuthorization(account, destinationChainId);
  const initCalls7702 = initCalls7702_ ?? (await get7702InitCalls(account));

  // Call getIntent with the converted parameters
  return getIntent(
    client,
    {
      recipient: account.address,
      callData,
      inputTokens: inputTokens ?? [],
      outputTokens: outputTokens ?? [],
      gasToken,
      chainId,
      initData,
      nonceKey,
      authorizationList:
        authorizationList_ ?? (authorization ? [authorization] : undefined),
      initCalls7702,
      delegated7702: isEip7702
        ? concat(["0xef0100", implementation])
        : undefined,
    },
    version,
  );
}
