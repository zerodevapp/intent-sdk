import type { Address, Hex } from "viem";
import type {
  INTENT_V1_VERSION_TYPE,
  INTENT_VERSION_TYPE,
} from "../types/intent.js";

export const ZERODEV_URLS = {
  INTENT_SERVICE: "https://intent.zerodev.app/v2/intent",
  RELAYER_SERVICE_MAINNET: "https://relayer.zerodev.app",
  RELAYER_SERVICE_TESTNET: "https://relayer-testnet.zerodev.app",
} as const;

// keccak256("SameChainOrder(bytes initData,bytes paymentData,bytes executionData)");
export const V2_SAME_CHAIN_ORDER_DATA_TYPE: Hex =
  "0x26c2053b2f46f1958f924d60dfe8bfc3259ddadd9241afcc55ed0c85edafcd42";

export const IntentVersionToAddressesMap: {
  [key in INTENT_VERSION_TYPE]: {
    intentExecutorAddress: Address;
  };
} = {
  "0.0.2": {
    intentExecutorAddress: "0xEBbB868402b94595262EB53799A927107f82e3A2",
  },
  "0.0.3": {
    intentExecutorAddress: "0xD0eb92AE315366A60527906B983A17Ae68aFCAE0",
  },
};

export const INTENT_V0_2: INTENT_V1_VERSION_TYPE = "0.0.2";

export const INTENT_V0_3: INTENT_V1_VERSION_TYPE = "0.0.3";
