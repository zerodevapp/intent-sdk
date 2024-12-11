import { describe, expect, test } from "bun:test";
import {
  parseUnits,
  zeroAddress,
} from "viem";
import { baseSepolia, sepolia } from "viem/chains";
import { getCabClient, timeout } from "./utils.js";
import type { GetUserIntentStatusResult } from "../actions/getUserIntentStatus.js";

describe("sendUserIntent", () => {

  test("should send intent with prepared order", async () => {
    const client = await getCabClient();

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
          address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
          amount: parseUnits("1.3", 6),
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
    console.timeEnd("sendUserIntent");
    console.log(result);

    let status: GetUserIntentStatusResult = { status: "NOT_FOUND" };
    console.time("getUserIntentStatus");
    while (status?.status !== "EXECUTED") {
      await new Promise(resolve => setTimeout(resolve, 1000));
      status = await client.getUserIntentStatus({
        uiHash: result.uiHash
      });
    }
    console.timeEnd("getUserIntentStatus");
    console.log(status);

    expect(result).toBeDefined();
    expect(result.uiHash).toBeDefined();
    expect(typeof result.uiHash).toBe("string");
    expect(result.uiHash.startsWith("0x")).toBe(true);
  }, {timeout});

  test.skip("should send intent with existing order", async () => {
    const client = await getCabClient();

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