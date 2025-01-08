import type { Address, Hex } from "viem";
import type {
  INTENT_V1_VERSION_TYPE,
  INTENT_VERSION_TYPE,
} from "../types/intent.js";

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

export const IntentVersionToAddressesMap: {
  [key in INTENT_VERSION_TYPE]: {
    intentExecutorAddress: Address;
  };
} = {
  "0.0.1": {
    intentExecutorAddress: "0x3E1bF561DEbE46C22cc1e85EC8283A5EB49f5dae",
  },
  "0.0.2": {
    intentExecutorAddress: "0xAd8da92Dd670871bD3f90475d6763d520728881a",
  },
};

export const INTENT_V0_1: INTENT_V1_VERSION_TYPE = "0.0.1";

export const INTENT_V0_2: INTENT_V1_VERSION_TYPE = "0.0.2";
