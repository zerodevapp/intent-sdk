import {
  type Address as SolanaAddress,
  type Base64EncodedWireTransaction,
  createSolanaRpc,
} from "@solana/kit";
import {
  type KernelAccountClientActions,
  type SmartAccountClientConfig,
  kernelAccountClientActions,
} from "@zerodev/sdk";
import {
  http,
  type Address,
  type ByteArray,
  type Chain,
  type Client,
  type Hex,
  type Prettify,
  type RpcSchema,
  type Transport,
  createClient,
  custom,
} from "viem";
import {
  type BundlerActions,
  type BundlerClientConfig,
  type PrepareUserOperationParameters,
  type SmartAccount,
  bundlerActions,
} from "viem/account-abstraction";
import type {
  EstimateUserIntentFeesParameters,
  EstimateUserIntentFeesResult,
} from "../actions/estimateUserIntentFees.js";
import type { GetCABParameters, GetCABResult } from "../actions/getCAB.js";
import type {
  GaslessCrossChainOrder,
  GetIntentParameters,
  GetIntentReturnType,
} from "../actions/getIntent.js";
import type { GetUserIntentStatusResult } from "../actions/getUserIntentStatus.js";
import type { RelayerSendUserIntentResult } from "../actions/sendUserIntent.js";
import type {
  GetUserIntentExecutionReceiptResult,
  GetUserIntentFillReceiptResult,
  GetUserIntentOpenReceiptResult,
} from "../actions/types.js";
import { ZERODEV_URLS } from "../config/constants.js";
import type { INTENT_VERSION_TYPE } from "../types/intent.js";
import {
  type IntentClientActions,
  intentClientActions,
} from "./decorators/intent.js";

export type IntentRpcSchema = [
  {
    Method: "ui_getIntent";
    Parameters: [GetIntentParameters];
    ReturnType: GetIntentReturnType;
  },
  {
    Method: "ui_getCAB";
    Parameters: [GetCABParameters];
    ReturnType: GetCABResult;
  },
  {
    Method: "ui_estimateIntentFees";
    Parameters: [EstimateUserIntentFeesParameters];
    ReturnType: EstimateUserIntentFeesResult;
  },
];

// Relayer methods
export type RelayerRpcSchema = [
  {
    Method: "rl_sendUserIntent";
    Parameters: [
      {
        order: GaslessCrossChainOrder;
        signature: Hex;
        version: INTENT_VERSION_TYPE;
        solanaTransaction: string | undefined;
      },
    ];
    ReturnType: RelayerSendUserIntentResult;
  },
  {
    Method: "rl_getUserIntentStatus";
    Parameters: [Hex, Address];
    ReturnType: GetUserIntentStatusResult;
  },
  {
    Method: "rl_getUserIntentOpenReceipt";
    Parameters: [Hex, Address];
    ReturnType: GetUserIntentOpenReceiptResult;
  },
  {
    Method: "rl_getUserIntentExecutionReceipt";
    Parameters: [Hex, Address];
    ReturnType: GetUserIntentExecutionReceiptResult;
  },
  {
    Method: "rl_getUserIntentFillReceipt";
    Parameters: [Hex, Address];
    ReturnType: GetUserIntentFillReceiptResult;
  },
];

// Combined schema for the Intent client
export type CombinedIntentRpcSchema = [...IntentRpcSchema, ...RelayerRpcSchema];

export type IntentClient<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
  client extends Client | undefined = Client | undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
> = Prettify<
  Client<
    transport,
    chain extends Chain
      ? chain
      : // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        client extends Client<any, infer chain>
        ? chain
        : undefined,
    account,
    rpcSchema extends RpcSchema
      ? [...rpcSchema, ...CombinedIntentRpcSchema]
      : CombinedIntentRpcSchema,
    BundlerActions<account> &
      KernelAccountClientActions<chain, account> &
      IntentClientActions<chain, account>
  >
> & {
  client: client;
  paymaster: BundlerClientConfig["paymaster"] | undefined;
  paymasterContext: BundlerClientConfig["paymasterContext"] | undefined;
  userOperation: BundlerClientConfig["userOperation"] | undefined;

  // Solana specific stuff
  solana?: {
    rpc: ReturnType<typeof createSolanaRpc>;
    address: SolanaAddress;
    signTransaction: (
      transaction: ByteArray,
    ) => Promise<Base64EncodedWireTransaction>;
    sendTransaction: (
      transaction: Base64EncodedWireTransaction,
    ) => Promise<string>;
  };
};

export type CreateIntentClientConfig<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
  client extends Client | undefined = Client | undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
> = SmartAccountClientConfig<transport, chain, account, client, rpcSchema> & {
  bundlerTransport: transport;
  intentTransport?: transport;
  relayerTransport?: transport;
  projectId?: string;
  version: INTENT_VERSION_TYPE;

  // Solana specific parameters
  solana?: {
    address: SolanaAddress;
    rpcUrl: string;
    signTransaction: (
      transaction: ByteArray,
    ) => Promise<Base64EncodedWireTransaction>;
  };
};

/**
 * Creates an ZeroDev Intent client
 * @param parameters - The configuration for the Intent client
 * @returns An Intent client
 *
 * @example
 * ```ts
 * // Simple intent client than can send intent across any EVM chains
 * const client = createIntentClient({
 *   chain: mainnet,
 *   account: kernelAccount,
 *   version: INTENT_V0_3,
 *   bundlerTransport: http(bundlerRpc),
 * });
 *
 * // Intent client that can send intents across any EVM / Solana chain using the @solana/kit SDK
 * const client = createIntentClient({
 *   account: kernelAccount,
 *   bundlerTransport: http(bundlerRpc),
 *   version: INTENT_V0_3,
 *   solana: {
 *     rpcUrl: 'https://api.mainnet-beta.solana.com',
 *     address: solanaSigner.address,
 *     signTransaction: async (transaction) => {
 *       const decoded = getTransactionDecoder().decode(transaction)
 *       const [signatures] = await solanaSigner.signTransactions([decoded])
 *       const newTransaction = {
 *         ...decoded,
 *         signatures: Object.freeze({
 *           ...decoded.signatures,
 *           ...signatures
 *         }),
 *       }
 *       return getBase64EncodedWireTransaction(newTransaction);
 *     },
 *   },
 * });
 *
 * // Intent client that can send intents across any EVM / Solana chain using the @solana/web3js SDK
 * // todo: Add guide around this
 * const client = createIntentClient({
 *   account: kernelAccount,
 *   bundlerTransport: http(bundlerRpc),
 *   version: INTENT_V0_3,
 *   solana: {
 *     rpcUrl: 'https://api.mainnet-beta.solana.com',
 *     address: solanaSigner.address,
 *     signTransaction: async (transaction) => {
 *       const decoded = getTransactionDecoder().decode(transaction)
 *       const [signatures] = await solanaSigner.signTransactions([decoded])
 *       const newTransaction = {
 *         ...decoded,
 *         signatures: Object.freeze({
 *           ...decoded.signatures,
 *           ...signatures
 *         }),
 *       }
 *       return getBase64EncodedWireTransaction(newTransaction);
 *     },
 *   },
 * });
 * ```
 */
export function createIntentClient<
  transport extends Transport,
  chain extends Chain | undefined = undefined,
  account extends SmartAccount | undefined = undefined,
  client extends Client | undefined = undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
>(
  parameters: CreateIntentClientConfig<
    transport,
    chain,
    account,
    client,
    rpcSchema
  >,
): IntentClient<transport, chain, account, client, rpcSchema>;

export function createIntentClient(
  parameters: CreateIntentClientConfig,
): IntentClient {
  const {
    client: client_,
    key = "Account",
    name = "Intent Client",
    paymaster,
    paymasterContext,
    bundlerTransport,
    chain,
    intentTransport: rawIntentTransport,
    relayerTransport: rawRelayerTransport,
    userOperation,
    version,
    projectId,
    solana,
  } = parameters;
  const intentTransport = rawIntentTransport
    ? rawIntentTransport
    : projectId
      ? http(`${ZERODEV_URLS.INTENT_SERVICE}/${projectId}`)
      : http(ZERODEV_URLS.INTENT_SERVICE);
  const baseTransportUrl = chain?.testnet
    ? ZERODEV_URLS.RELAYER_SERVICE_TESTNET
    : ZERODEV_URLS.RELAYER_SERVICE_MAINNET;
  const relayerTransport = rawRelayerTransport
    ? rawRelayerTransport
    : projectId
      ? http(`${baseTransportUrl}/${projectId}`)
      : http(baseTransportUrl);

  // Create a custom transport that routes methods to the appropriate transport
  const transport = custom({
    request: async ({ method, params }) => {
      // Route bundler methods (eth_*)
      if (method.startsWith("eth_")) {
        return bundlerTransport({}).request({ method, params });
      }

      // Route intent methods (ui_*)
      if (method.startsWith("ui_")) {
        return intentTransport({}).request({ method, params });
      }

      // Route relay methods (rl_*)
      if (method.startsWith("rl_")) {
        return relayerTransport({}).request({ method, params });
      }

      // Default to bundler transport for other methods
      return bundlerTransport({}).request({ method, params });
    },
  });

  const client = Object.assign(
    createClient({
      ...parameters,
      chain: parameters.chain ?? client_?.chain,
      transport,
      key,
      name,
      type: "intentClient",
    }),
    {
      client: client_,
      paymaster,
      paymasterContext,
      userOperation,
      solana: solana
        ? {
            ...solana,
            rpc: createSolanaRpc(solana.rpcUrl),
          }
        : undefined,
    },
  ) as unknown as IntentClient;

  if (parameters.userOperation?.prepareUserOperation) {
    const customPrepareUserOp = parameters.userOperation.prepareUserOperation;

    return (
      client
        .extend(bundlerActions)
        .extend(kernelAccountClientActions())
        .extend((client) => ({
          prepareUserOperation: (args: PrepareUserOperationParameters) => {
            return customPrepareUserOp(client, args);
          },
        }))
        // @ts-ignore : we know that the intentClientActions will return the correct type
        .extend(intentClientActions(version)) as IntentClient
    );
  }

  return (
    client
      .extend(bundlerActions)
      .extend(kernelAccountClientActions())
      // @ts-ignore : we know that the intentClientActions will return the correct type
      .extend(intentClientActions(version)) as IntentClient
  );
}
