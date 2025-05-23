import type { Hex } from "viem";

export type INTENT_V1_VERSION_TYPE = "0.0.2" | "0.0.3" | "0.0.4";

export type INTENT_VERSION_TYPE = INTENT_V1_VERSION_TYPE;

export type UserIntentHash = {
  uiHash: Hex;
};

export type GAS_TOKEN_TYPE = "SPONSORED" | "NATIVE" | "USDC" | "USDT";
