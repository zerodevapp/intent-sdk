import type {
  Address as SolanaAddress,
  Rpc,
  SolanaRpcApi,
  TransactionSigner,
} from "@solana/kit";
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
import { SOLANA_CHAIN_ID } from "../utils/constants.js";
import type { GetIntentReturnType } from "./getIntent.js";
import { getIntent } from "./getIntent.js";

export type PrepareUserIntentParameters<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  calls extends readonly unknown[] = readonly unknown[],
  solanaRpc extends Rpc<SolanaRpcApi> | undefined =
    | Rpc<SolanaRpcApi>
    | undefined,
  solanaSigner extends TransactionSigner | undefined =
    | TransactionSigner
    | undefined,
> = PrepareUserOperationParameters<account, accountOverride, calls> & {
  inputTokens?: Array<{
    address: Hex;
    amount?: bigint;
    chainId: number;
  }>;
  outputTokens?: Array<{
    address: Hex | SolanaAddress;
    amount: bigint;
    chainId: number;
  }>;
  gasToken?: "SPONSORED" | "NATIVE";
  chainId?: number;
  solanaRpc?: solanaRpc;
  solanaSigner?: solanaSigner;
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
  SolanaRpc extends Rpc<SolanaRpcApi> | undefined =
    | Rpc<SolanaRpcApi>
    | undefined,
  SolanaSigner extends TransactionSigner | undefined =
    | TransactionSigner
    | undefined,
>(
  client: Client<Transport, chain, account, CombinedIntentRpcSchema>,
  parameters: PrepareUserIntentParameters<
    account,
    accountOverride,
    calls,
    SolanaRpc,
    SolanaSigner
  >,
  version: INTENT_VERSION_TYPE,
  solanaSigner: TransactionSigner | undefined,
  solanaRpc: Rpc<SolanaRpcApi> | undefined,
): Promise<PrepareUserIntentResult> {
  const { account: account_ = client.account } = parameters;
  if (!account_) throw new AccountNotFoundError();

  const account = parseAccount(
    account_,
  ) as SmartAccount<KernelSmartAccountImplementation>;

  // Convert the user intent parameters to getIntent parameters
  const { inputTokens, outputTokens, chainId, gasToken } = parameters;

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
  const desinationChainId =
    outputTokens?.length && outputTokens.length > 0
      ? outputTokens[0].chainId
      : chainId;
  if (!desinationChainId) {
    throw new Error("please provide either outputTokens or chainId");
  }
  const recipient =
    BigInt(desinationChainId) === SOLANA_CHAIN_ID
      ? solanaSigner?.address
      : account.address;
  if (!recipient) throw new Error("please provide solanaSigner");

  // Call getIntent with the converted parameters
  return getIntent(
    client,
    {
      sender: account.address,
      recipient: recipient,
      callData,
      inputTokens: inputTokens ?? [],
      outputTokens: outputTokens ?? [],
      gasToken,
      chainId,
      initData,
    },
    version,
    solanaSigner,
    solanaRpc,
  );
}
