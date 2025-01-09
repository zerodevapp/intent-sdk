import { expect, test } from "bun:test";
import { getTestingChain, getIntentClient } from "./utils.js";

test("getCAB", async () => {
  const client = await getIntentClient(getTestingChain());
  const accountAddress = client.account?.address;
  if (!accountAddress) throw new Error("Account not found");

  const result = await client.getCAB({
    accountAddress,
    tokenTickers: ["ETH", "USDC"],
  });
  console.log(JSON.stringify(result, null, 2));

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