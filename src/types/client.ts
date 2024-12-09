import { type KernelAccountClient } from "@zerodev/sdk";
import type { Chain } from "viem";

export type CabClient = KernelAccountClient & {
  chain: Chain;
  actions: {
    prepareUserIntent: (
      params: PrepareUserIntentParams,
    ) => Promise<PrepareUserIntentResult>;
  };
};

// Placeholder types to be updated with actual parameters and result
export type PrepareUserIntentParams = {
  // Placeholder property to avoid empty object type
  _placeholder?: never;
};

export type PrepareUserIntentResult = {
  // Placeholder property to avoid empty object type
  _placeholder?: never;
};
