import type { GetIntentParameters, GetIntentReturnType } from "../actions/getIntent.js";

export type IntentRpcSchema = [
  {
    Method: "ui_getIntent";
    Parameters: [GetIntentParameters];
    ReturnType: GetIntentReturnType;
  }
];

// Placeholder for future relay methods
export type RelayerRpcSchema = [
  // Will add ui_sendIntent and other relay methods later
];

// Combined schema for the CAB client
export type CabRpcSchema = [...IntentRpcSchema, ...RelayerRpcSchema]; 