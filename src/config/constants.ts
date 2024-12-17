import type { Address } from "viem";

export const ZERODEV_URLS = {
  INTENT_SERVICE: "https://user-intent-service.onrender.com/intent",
  RELAYER_SERVICE_MAINNET: "https://relayer-d6ne.onrender.com",
  RELAYER_SERVICE_TESTNET: "https://relayer-testnet.onrender.com",
} as const;

export const INTENT_EXECUTOR: Address =
  "0x04Eb0aDE11ec34cd4F41f9Ed516ada5c2eBffad2";
