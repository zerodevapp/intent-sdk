import type { Address, Hex } from "viem";

export const ZERODEV_URLS = {
  INTENT_SERVICE: "https://user-intent-service.onrender.com/intent",
  RELAYER_SERVICE_MAINNET: "https://relayer-d6ne.onrender.com",
  RELAYER_SERVICE_TESTNET: "https://relayer-testnet.onrender.com",
} as const;

export const INTENT_EXECUTOR: Address =
  "0x3E1bF561DEbE46C22cc1e85EC8283A5EB49f5dae";

// keccak256(abi.encode("SAME_CHAIN"));
export const SAME_CHAIN_ORDER_DATA_TYPE: Hex =
  "0xcb571c492be65e1ab6b3b279b36ac8d22472959a6c27d22460477e26bd32776a";
