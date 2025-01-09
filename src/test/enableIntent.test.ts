import { describe, expect, test } from "bun:test";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import {
  createKernelAccount,
  createZeroDevPaymasterClient,
} from "@zerodev/sdk";
import {
  KERNEL_V3_0,
  KERNEL_V3_2,
  getEntryPoint,
} from "@zerodev/sdk/constants";
import { http, zeroAddress } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createIntentClient } from "../client/intentClient.js";
import { INTENT_V0_1 } from "../config/constants.js";
import {
  BUNDLER_RPC,
  PAYMASTER_RPC,
  getPublicClient,
  getTestingChain,
  index,
  timeout,
} from "./utils.js";

describe("enableIntent", () => {
  test(
    "should upgrade kernel and install intent executor",
    async () => {
      // Setup public client
      const publicClient = getPublicClient();

      // Create kernel account with v3.0
      const signer = privateKeyToAccount(generatePrivateKey());
      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer,
        kernelVersion: KERNEL_V3_0,
        entryPoint: getEntryPoint("0.7"),
      });

      const kernelAccount = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator,
        },
        kernelVersion: KERNEL_V3_0,
        entryPoint: getEntryPoint("0.7"),
        index,
      });
      console.log("Kernel account:", kernelAccount.address);

      // Create intent client
      const client = createIntentClient({
        account: kernelAccount,
        chain: getTestingChain(),
        bundlerTransport: http(BUNDLER_RPC, { timeout }),
        paymaster: createZeroDevPaymasterClient({
          chain: getTestingChain(),
          transport: http(PAYMASTER_RPC, { timeout }),
        }),
        client: publicClient,
        version: INTENT_V0_1,
      });
      // Dummy transaction to deploy the kernel
      const tx = await client.sendTransaction({
        to: zeroAddress,
        value: 0n,
        data: "0x",
      });
      console.log("Dummy transaction:", tx);

      // Enable intent
      const hash = await client.enableIntent();
      console.log("Enable intent uo hash:", hash);
      const receipt = await client.waitForUserOperationReceipt({
        hash,
      });
      console.log("Enable intent receipt:", receipt.receipt.transactionHash);
      const newEcdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer,
        kernelVersion: KERNEL_V3_2,
        entryPoint: getEntryPoint("0.7"),
      });
      const newkernelAccount = await createKernelAccount(publicClient, {
        plugins: {
          sudo: newEcdsaValidator,
        },
        kernelVersion: KERNEL_V3_2,
        entryPoint: getEntryPoint("0.7"),
        index,
        address: kernelAccount.address,
      });
      console.log("New kernel account:", newkernelAccount.address);

      //   Create intent client
      const newClient = createIntentClient({
        account: newkernelAccount,
        chain: getTestingChain(),
        bundlerTransport: http(BUNDLER_RPC, { timeout }),
        paymaster: createZeroDevPaymasterClient({
          chain: getTestingChain(),
          transport: http(PAYMASTER_RPC, { timeout }),
        }),
        client: publicClient,
        version: INTENT_V0_1,
      });
      const newTx = await newClient.sendTransaction({
        to: zeroAddress,
        value: 0n,
        data: "0x",
      });
      console.log("New transaction:", newTx);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash.startsWith("0x")).toBe(true);
    },
    { timeout },
  );
});
