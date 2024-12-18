import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KernelV3_1AccountAbi, createKernelAccount } from "@zerodev/sdk";
import { KERNEL_V3_2, getEntryPoint } from "@zerodev/sdk/constants";
import {
  http,
  type Chain,
  type Hex,
  type Transport,
  concatHex,
  createPublicClient,
  encodeFunctionData,
  zeroAddress,
  encodeAbiParameters,
  parseAbiParameters,
} from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { createIntentClient } from "../client/intentClient.js";
import type { IntentClient } from "../client/intentClient.js";

export const TEST_PRIVATE_KEY = process.env.PRIVATE_KEY as Hex;
export const BUNDLER_RPC = "https://rpc.zerodev.app/api/v2/bundler/";
export const PAYMASTER_RPC =
  "https://rpc.zerodev.app/api/v2/paymaster/";
export const INTENT_SERVICE_RPC = "http://127.0.0.1:3000/intent";
export const RELAYER_SERVICE_RPC = "http://127.0.0.1:8080";
export const kernelVersion = KERNEL_V3_2;
const entryPoint = getEntryPoint("0.7");
const intentExecutorAddress = "0x04Eb0aDE11ec34cd4F41f9Ed516ada5c2eBffad2"; // "0xcEa9E1ED495f549E2ecEfc5f66b5e82c8F63af6D";
export const index = 0n;
export const timeout = 100000000;

export function getTestingChain(): Chain {
  return sepolia;
}

export function getPublicClient() {
  return createPublicClient({
    chain: getTestingChain(),
    transport: http(),
  });
}

export async function getIntentClient(): Promise<
  IntentClient<Transport, Chain, SmartAccount>
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
    functionName: "installModule",
    args: [BigInt(2), intentExecutorAddress, concatHex([zeroAddress, encodeAbiParameters(parseAbiParameters(["bytes", "bytes"]), ["0x", "0x"])])],
  });

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

  const client = createIntentClient({
    account: kernelAccount,
    chain: getTestingChain(),
    bundlerTransport: http(BUNDLER_RPC, { timeout }),
    // intentTransport: http(INTENT_SERVICE_RPC),
    // relayerTransport: http(RELAYER_SERVICE_RPC),
  });
  return client;
}
