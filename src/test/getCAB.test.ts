import { describe, expect, test } from "bun:test";
import { sepolia } from "viem/chains";
import { getIntentClient, getTestingChain } from "./utils.js";
import * as allChains from "viem/chains";

describe("getCAB", () => {
  test("should get balances with token filter", async () => {
    const client = await getIntentClient(getTestingChain());
    const accountAddress = client.account?.address;
    if (!accountAddress) throw new Error("Account not found");

    const result = await client.getCAB({
      accountAddress,
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

  test("should get balances with network filter", async () => {
    const client = await getIntentClient(getTestingChain());
    const accountAddress = client.account?.address;
    if (!accountAddress) throw new Error("Account not found");

    const result = await client.getCAB({
      accountAddress,
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

  test("should get balances with networkType", async () => {
    const client = await getIntentClient(getTestingChain());
    const accountAddress = client.account?.address;
    if (!accountAddress) throw new Error("Account not found");

    const result = await client.getCAB({
      accountAddress,
      networkType: "testnet",
    });

    expect(result.tokens).toBeDefined();
    expect(result.tokens.length).toBeGreaterThanOrEqual(0);
    for (const token of result.tokens) {
      for (const b of token.breakdown) {
        // filter out allChain based on chainId and check if `testnet` is truthy
        const chain = Object.values(allChains)
          .filter((c) => typeof c === "object" && c !== null)
          .find((c) => c.id === b.chainId);
        expect(chain?.testnet).toBeTruthy();
      }
    }
  });

  test("should normalize amounts to lowest decimal", async () => {
    const client = await getIntentClient(getTestingChain());
    const accountAddress = client.account?.address;
    if (!accountAddress) throw new Error("Account not found");

    const result = await client.getCAB({
      accountAddress,
      tokenTickers: ["USDC"],
      networks: [sepolia.id],
    });

    if (result.tokens.length > 0) {
      const token = result.tokens[0];
      // Total amount should be the sum of normalized breakdown amounts
      const totalAmount = BigInt(token.amount);
      const breakdownSum = token.breakdown.reduce(
        (sum, b) => sum + BigInt(b.amount),
        0n
      );
      expect(totalAmount).toBe(breakdownSum);
    }
  });
});
