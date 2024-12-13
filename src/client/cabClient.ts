import {
  type KernelAccountClientActions,
  type SmartAccountClientConfig,
  kernelAccountClientActions,
} from "@zerodev/sdk";
import {
  http,
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
  GaslessCrossChainOrder,
  GetIntentParameters,
  GetIntentReturnType,
} from "../actions/getIntent.js";
import type { GetUserIntentStatusResult } from "../actions/getUserIntentStatus.js";
import type { SendUserIntentResult } from "../actions/sendUserIntent.js";
import { ZERODEV_URLS } from "../config/constants.js";
import { type CabClientActions, cabClientActions } from "./decorators/cab.js";

export type IntentRpcSchema = [
  {
    Method: "ui_getIntent";
    Parameters: [GetIntentParameters];
    ReturnType: GetIntentReturnType;
  },
];

// Relayer methods
export type RelayerRpcSchema = [
  {
    Method: "rl_sendUserIntent";
    Parameters: [{ order: GaslessCrossChainOrder; signature: Hex }];
    ReturnType: SendUserIntentResult;
  },
  {
    Method: "rl_getUserIntentStatus";
    Parameters: [Hex];
    ReturnType: GetUserIntentStatusResult;
  },
];

// Combined schema for the CAB client
export type CabRpcSchema = [...IntentRpcSchema, ...RelayerRpcSchema];

export type CabClient<
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
      ? [...rpcSchema, ...CabRpcSchema]
      : CabRpcSchema,
    BundlerActions<account> &
      KernelAccountClientActions<chain, account> &
      CabClientActions<chain, account>
  >
> & {
  client: client;
  paymaster: BundlerClientConfig["paymaster"] | undefined;
  paymasterContext: BundlerClientConfig["paymasterContext"] | undefined;
  userOperation: BundlerClientConfig["userOperation"] | undefined;
};

export type CreateCabClientConfig<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
  client extends Client | undefined = Client | undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
> = SmartAccountClientConfig<transport, chain, account, client, rpcSchema> & {
  bundlerTransport: transport;
  intentTransport?: transport;
  relayerTransport?: transport;
};

export function createCabClient<
  transport extends Transport,
  chain extends Chain | undefined = undefined,
  account extends SmartAccount | undefined = undefined,
  client extends Client | undefined = undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
>(
  parameters: CreateCabClientConfig<
    transport,
    chain,
    account,
    client,
    rpcSchema
  >,
): CabClient<transport, chain, account, client, rpcSchema>;

export function createCabClient(parameters: CreateCabClientConfig): CabClient {
  const {
    client: client_,
    key = "Account",
    name = "CAB Client",
    paymaster,
    paymasterContext,
    bundlerTransport,
    intentTransport = http(ZERODEV_URLS.INTENT_SERVICE),
    relayerTransport = http(ZERODEV_URLS.RELAYER_SERVICE),
    userOperation,
  } = parameters;

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
      type: "cabClient",
    }),
    { client: client_, paymaster, paymasterContext, userOperation },
  );

  if (parameters.userOperation?.prepareUserOperation) {
    const customPrepareUserOp = parameters.userOperation.prepareUserOperation;

    return client
      .extend(bundlerActions)
      .extend(kernelAccountClientActions())
      .extend((client) => ({
        prepareUserOperation: (args: PrepareUserOperationParameters) => {
          return customPrepareUserOp(client, args);
        },
      }))
      .extend(cabClientActions()) as CabClient;
  }

  return client
    .extend(bundlerActions)
    .extend(kernelAccountClientActions())
    .extend(cabClientActions()) as CabClient;
}
