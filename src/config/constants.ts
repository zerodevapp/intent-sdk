import type { Address } from "viem";

export const ZERODEV_URLS = {
  INTENT_SERVICE: "https://user-intent-service.onrender.com/intent",
  RELAYER_SERVICE_MAINNET: "https://relayer-d6ne.onrender.com",
  RELAYER_SERVICE_TESTNET: "https://relayer-testnet.onrender.com",
} as const;

export const INTENT_EXECUTOR: Address =
  "0x3E1bF561DEbE46C22cc1e85EC8283A5EB49f5dae";
