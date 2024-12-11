import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount, KernelV3_1AccountAbi } from "@zerodev/sdk";
import { getEntryPoint } from "@zerodev/sdk/constants";
import {
  type Chain,
  concatHex,
  createPublicClient,
  encodeFunctionData,
  type Hex,
  http,
  type Transport,
  zeroAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { createCabClient } from "../client/cabClient.js";
import type { CabClient } from "../client/cabClient.js";
import type { SmartAccount } from "viem/account-abstraction";

export const TEST_PRIVATE_KEY = process.env.PRIVATE_KEY as Hex;
export const BUNDLER_RPC = "http://localhost:3000/rpc";
export const INTENT_SERVICE_RPC = "http://localhost:3000/intent";
export const RELAYER_SERVICE_RPC = "http://localhost:8080";
export const kernelVersion = "0.3.1";
const entryPoint = getEntryPoint("0.7");
const intentExecutorAddress = "0xcEa9E1ED495f549E2ecEfc5f66b5e82c8F63af6D";
export const index = 0n;

export function getTestingChain(): Chain {
  return sepolia;
}

export function getPublicClient() {
  return createPublicClient({
    chain: getTestingChain(),
    transport: http(),
  });
}

export async function getCabClient(): Promise<
  CabClient<Transport, Chain, SmartAccount>
> {
  const publicClient = getPublicClient();
  const signer = privateKeyToAccount(TEST_PRIVATE_KEY);

  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer: { ...signer, source: "local" as "local" | "external" },
    kernelVersion,
    entryPoint,
  });

  const installModuleData = encodeFunctionData({
    abi: KernelV3_1AccountAbi,
    functionName: 'installModule',
    args: [
      BigInt(2),
      intentExecutorAddress,
      concatHex([zeroAddress, "0x"])
    ]
  })

  const kernelAccount = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
    kernelVersion,
    entryPoint,
    index,
    initConfig: [installModuleData],
    useReplayableSignature: true,
  });

  const client = createCabClient({
    account: kernelAccount,
    chain: getTestingChain(),
    bundlerTransport: http(BUNDLER_RPC),
    // intentTransport: http(INTENT_SERVICE_RPC),
    // relayerTransport: http(RELAYER_SERVICE_RPC),
  });
  return client;
}
