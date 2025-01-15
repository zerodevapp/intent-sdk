import { describe, expect, test } from "bun:test";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { createKernelAccount } from "@zerodev/sdk";
import { getEntryPoint } from "@zerodev/sdk/constants";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as allChains from "viem/chains";
import {
  getIntentClient,
  getPublicClient,
  getTestingChain,
  kernelVersion,
} from "./utils.js";

describe("getCAB", () => {
  test("should get balances using connected account", async () => {
    const client = await getIntentClient(getTestingChain());

    const result = await client.getCAB({
      tokenTickers: ["ETH", "USDC"],
      networkType: "testnet",
    });

    expect(result).toMatchObject({
      tokens: expect.arrayContaining([
        expect.objectContaining({
          ticker: expect.any(String),
          amount: expect.stringMatching(/^0x[0-9a-fA-F]+$/),
          decimal: expect.any(Number),
          breakdown: expect.arrayContaining([
            expect.objectContaining({
              chainId: expect.any(Number),
              address: expect.stringMatching(/^0x[0-9a-fA-F]{40}$/),
              amount: expect.stringMatching(/^0x[0-9a-fA-F]+$/),
            }),
          ]),
        }),
      ]),
    });
  });

  test("should get balances using specific address", async () => {
    const client = await getIntentClient(getTestingChain());
    const someAddress = "0x1234567890123456789012345678901234567890";

    const result = await client.getCAB({
      accountAddress: someAddress,
      networks: [sepolia.id],
    });

    expect(result.tokens).toBeDefined();
    expect(result.tokens.length).toBeGreaterThanOrEqual(0);
    for (const token of result.tokens) {
      for (const b of token.breakdown) {
        expect(b.chainId).toBe(sepolia.id);
      }
    }
  });

  test("should get balances using specific account", async () => {
    const publicClient = getPublicClient();
    const signer = privateKeyToAccount(
      "0x1234567890123456789012345678901234567890123456789012345678901234",
    );
    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer,
      kernelVersion,
      entryPoint: getEntryPoint("0.7"),
    });

    const kernelAccount = await createKernelAccount(publicClient, {
      plugins: {
        sudo: ecdsaValidator,
      },
      kernelVersion,
      entryPoint: getEntryPoint("0.7"),
    });

    const client = await getIntentClient(getTestingChain());
    const result = await client.getCAB({
      account: kernelAccount,
      networkType: "testnet",
    });

    expect(result.tokens).toBeDefined();
    for (const token of result.tokens) {
      for (const b of token.breakdown) {
        const chain = Object.values(allChains)
          .filter((c) => typeof c === "object" && c !== null)
          .find((c) => c.id === b.chainId);
        expect(chain?.testnet).toBeTruthy();
      }
    }
  });

  test("should normalize amounts to lowest decimal", async () => {
    const client = await getIntentClient(getTestingChain());

    const result = await client.getCAB({
      tokenTickers: ["USDC"],
      networks: [sepolia.id],
    });

    if (result.tokens.length > 0) {
      const token = result.tokens[0];
      // Total amount should be the sum of normalized breakdown amounts
      const totalAmount = BigInt(token.amount);
      const breakdownSum = token.breakdown.reduce(
        (sum, b) => sum + BigInt(b.amount),
        0n,
      );
      expect(totalAmount).toBe(breakdownSum);
    }
  });
});
