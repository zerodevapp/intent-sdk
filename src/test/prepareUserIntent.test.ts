import { describe, expect, test } from "bun:test";
import { parseUnits, zeroAddress } from "viem";
import { baseSepolia, sepolia } from "viem/chains";
import { getIntentClient } from "./utils.js";

describe("prepareUserIntent", () => {
  test("should prepare user intent", async () => {
    const client = await getIntentClient();
    console.log({ accountAddress: client.account.address });
    await client.enableIntent();

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
    console.log(intent);

    expect(intent).toBeDefined();
    expect(intent.order.orderData).toBeDefined();
    expect(intent.order.orderDataType).toBeDefined();
    expect(BigInt(intent.order.originChainId)).toBe(BigInt(sepolia.id));
  });
});
