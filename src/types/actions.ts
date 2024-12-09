import type {
  GetIntentParameters,
  GetIntentReturnType,
} from "../actions/getIntent.js";

export type PrepareUserIntentParameters = {
  to: `0x${string}`;
  value: bigint;
  data: `0x${string}`;
};

export type PrepareUserIntentResult = GetIntentReturnType;

export type CabClientActions = {
  getIntent: (parameters: GetIntentParameters) => Promise<GetIntentReturnType>;
  prepareUserIntent: (
    parameters: PrepareUserIntentParameters
  ) => Promise<PrepareUserIntentResult>;
};

export type { CabClient } from "../client/cabClient.js";
