import { describe, expect, test } from "bun:test";
import { zeroAddress } from "viem";
import {
  MAINNET_TOKEN_ROUTES,
  MAINNET_TOKEN_ROUTES_SAME_CHAIN,
  TESTNET_TOKEN_ROUTES,
} from "./tokenRoutes.js";
import { getIntentClient } from "./utils.js";

describe.skip("prepareUserIntent with TESTNET_TOKEN_ROUTES", () => {
  for (const routesWithChain of TESTNET_TOKEN_ROUTES) {
    for (const route of routesWithChain.routes) {
      test(`should prepare user intent for route: ${route.name}`, async () => {
        const client = await getIntentClient(routesWithChain.chain);

        const intent = await client.prepareUserIntent({
          calls: [
            {
              to: zeroAddress,
              value: 0n,
              data: "0x",
            },
          ],
          inputTokens: route.inputTokens,
          outputTokens: route.outputTokens,
        });
        expect(intent).toBeDefined();
        expect(intent.order.orderData).toBeDefined();
        expect(intent.order.orderDataType).toBeDefined();
        expect(BigInt(intent.order.originChainId)).toBe(
          BigInt(routesWithChain.chain.id),
        );
      }, 60000);
    }
  }
});

describe.skip("prepareUserIntent with MAINNET_TOKEN_ROUTES", () => {
  for (const routesWithChain of MAINNET_TOKEN_ROUTES) {
    for (const route of routesWithChain.routes) {
      test(`should prepare user intent for route: ${route.name}`, async () => {
        const client = await getIntentClient(routesWithChain.chain);

        const intent = await client.prepareUserIntent({
          calls: [
            {
              to: zeroAddress,
              value: 0n,
              data: "0x",
            },
          ],
          inputTokens: route.inputTokens,
          outputTokens: route.outputTokens,
        });
        expect(intent).toBeDefined();
        expect(intent.order.orderData).toBeDefined();
        expect(intent.order.orderDataType).toBeDefined();
        expect(BigInt(intent.order.originChainId)).toBe(
          BigInt(routesWithChain.chain.id),
        );
      }, 60000);
    }
  }
});

describe.skip("prepareUserIntent with MAINNET_TOKEN_ROUTES", () => {
  for (const routesWithChain of MAINNET_TOKEN_ROUTES) {
    for (const route of routesWithChain.routes) {
      test(`should prepare user intent for route: ${route.name}`, async () => {
        const client = await getIntentClient(routesWithChain.chain);

        const intent = await client.prepareUserIntent({
          calls: [
            {
              to: zeroAddress,
              value: 0n,
              data: "0x",
            },
          ],
          inputTokens: route.inputTokens,
          outputTokens: route.outputTokens,
        });
        expect(intent).toBeDefined();
        expect(intent.order.orderData).toBeDefined();
        expect(intent.order.orderDataType).toBeDefined();
        expect(BigInt(intent.order.originChainId)).toBe(
          BigInt(routesWithChain.chain.id),
        );
      }, 60000);
    }
  }
});

describe.skip("same-chain prepareUserIntent with MAINNET_TOKEN_ROUTES_SAME_CHAIN", () => {
  for (const routesWithChain of MAINNET_TOKEN_ROUTES_SAME_CHAIN) {
    for (const route of routesWithChain.routes) {
      test(`should prepare user intent for route: ${route.name}`, async () => {
        const client = await getIntentClient(routesWithChain.chain);

        const intent = await client.prepareUserIntent({
          calls: [
            {
              to: zeroAddress,
              value: 0n,
              data: "0x",
            },
          ],
          chainId: routesWithChain.chain.id,
          gasTokens: route.inputTokens,
          inputTokens: route.inputTokens,
          outputTokens: route.outputTokens,
        });
        expect(intent).toBeDefined();
        expect(intent.order.orderData).toBeDefined();
        expect(intent.order.orderDataType).toBeDefined();
        expect(BigInt(intent.order.originChainId)).toBe(
          BigInt(routesWithChain.chain.id),
        );
      }, 60000);
    }
  }
});
