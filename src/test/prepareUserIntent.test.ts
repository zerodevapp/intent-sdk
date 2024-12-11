import { beforeAll, describe, expect, test } from "bun:test";
import {
  type Address,
  encodeFunctionData,
  parseUnits,
  toHex,
  zeroAddress,
} from "viem";
import { baseSepolia, sepolia } from "viem/chains";
import { getCabClient } from "./utils.js";

describe("prepareUserIntent", () => {
  test("should prepare intent with callData", async () => {
    const client = await getCabClient();
    console.log({ accountAddress: client.account.address });

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
    expect(intent.orderData).toBeDefined();
    expect(intent.orderDataType).toBeDefined();
    expect(BigInt(intent.originChainId)).toBe(BigInt(sepolia.id));
  });

//   test.skip("should prepare intent with calls", async () => {
//     const client = await getCabClient();
//     const account = client.account;

//     const to = "0x1234567890123456789012345678901234567890" as Address;
//     const value = parseUnits("1", 18);
//     const data = encodeFunctionData({
//       abi: [
//         {
//           type: "function",
//           name: "transfer",
//           inputs: [
//             { type: "address", name: "to" },
//             { type: "uint256", name: "value" },
//           ],
//           outputs: [{ type: "bool" }],
//         },
//       ],
//       functionName: "transfer",
//       args: [to, value],
//     });

//     const intent = await client.prepareUserIntent({
//       account,
//       calls: [
//         {
//           to,
//           value,
//           data,
//         },
//       ],
//       inputTokens: [
//         {
//           address: to,
//           amount: value,
//           chainId: BigInt(sepolia.id),
//         },
//       ],
//       outputTokens: [
//         {
//           address: to,
//           amount: value,
//           chainId: BigInt(sepolia.id),
//         },
//       ],
//     });

//     expect(intent).toBeDefined();
//     expect(intent.orderData).toBeDefined();
//     expect(intent.orderDataType).toBeDefined();
//     expect(intent.originChainId).toBe(BigInt(sepolia.id));
//   });
});
