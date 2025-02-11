import { describe, expect, test } from "bun:test";
import { parseUnits, zeroAddress } from "viem";
import { optimism } from "viem/chains";
import { getIntentClient } from "./utils.js";

describe("prepareUserIntent", () => {
  test("should prepare user intent", async () => {
    const client = await getIntentClient();
    console.log({ accountAddress: client.account.address });
    // await client.enableIntent();

    const intent = await client.prepareUserIntent({
      calls: [
        {
          to: zeroAddress,
          value: 0n,
          data: "0x",
        },
      ],
      // inputTokens: [
      //   {
      //     chainId: sepolia.id,
      //     address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      //     // amount: parseUnits("5", 6),
      //   },
      // ],
      outputTokens: [
        {
          chainId: optimism.id,
          address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
          amount: parseUnits("0.6", 6),
        },
      ],
      // [
      //   {
      //     chainId: base.id,
      //     address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      //     // amount: parseUnits("10", 6),
      //   },
      //   ],
      // chainId: baseSepolia.id,
    });
    console.log(intent);

    expect(intent).toBeDefined();
    expect(intent.orders[0].orderData).toBeDefined();
    expect(intent.orders[0].orderDataType).toBeDefined();
    // expect(BigInt(intent.order.originChainId)).toBe(BigInt(sepolia.id));
  }, 1000000);
});
