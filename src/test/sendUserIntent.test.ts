import { describe, expect, test } from "bun:test";
import { parseUnits, zeroAddress } from "viem";
import { baseSepolia, sepolia } from "viem/chains";
import { getIntentClient, timeout } from "./utils.js";

describe("sendUserIntent", () => {
  test(
    "should send intent with prepared order",
    async () => {
      const client = await getIntentClient();
      console.log(client.account.address);

      console.time("sendUserIntent");
      const result = await client.sendUserIntent({
        calls: [
          {
            to: zeroAddress,
            value: 0n,
            data: "0x",
          },
        ],
        inputTokens: [
          {
            chainId: sepolia.id,
            address: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
          },
        ],
        outputTokens: [
          {
            chainId: baseSepolia.id,
            address: "0x4200000000000000000000000000000000000006",
            amount: parseUnits("0.00005", 18),
          },
        ],
      });
      console.timeEnd("sendUserIntent");
      console.log(result);

      console.time("waitForUserIntentExecutionReceipt");
      const receipt = await client.waitForUserIntentExecutionReceipt({
        uiHash: result.uiHash,
      });
      console.timeEnd("waitForUserIntentExecutionReceipt");
      console.log(receipt);

      expect(result).toBeDefined();
      expect(result.uiHash).toBeDefined();
      expect(typeof result.uiHash).toBe("string");
      expect(result.uiHash.startsWith("0x")).toBe(true);
    },
    { timeout },
  );

  test.skip("should send intent with existing order", async () => {
    const client = await getIntentClient();

    // First prepare an order
    const intent = await client.prepareUserIntent({
      calls: [
        {
          to: zeroAddress,
          value: 0n,
          data: "0x",
        },
      ],
      inputTokens: [
        {
          chainId: sepolia.id,
          address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
          amount: parseUnits("1.2", 6),
        },
      ],
      outputTokens: [
        {
          chainId: baseSepolia.id,
          address: "0x036cbd53842c5426634e7929541ec2318f3dcf7e",
          amount: parseUnits("1", 6),
        },
      ],
    });

    // Then send it directly
    const result = await client.sendUserIntent({
      intent,
    });

    expect(result).toBeDefined();
    expect(result.uiHash).toBeDefined();
    expect(typeof result.uiHash).toBe("string");
    expect(result.uiHash.startsWith("0x")).toBe(true);
  });
});
