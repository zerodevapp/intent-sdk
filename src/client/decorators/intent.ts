import type { Chain, Client, Transport } from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import {
  type EnableIntentResult,
  enableIntent,
} from "../../actions/enableIntent.js";
import {
  type GetIntentParameters,
  type GetIntentReturnType,
  getIntent,
} from "../../actions/getIntent.js";
import { getUserIntentExecutionReceipt } from "../../actions/getUserIntentExecutionReceipt.js";
import { getUserIntentOpenReceipt } from "../../actions/getUserIntentOpenReceipt.js";
import {
  type GetUserIntentStatusParameters,
  type GetUserIntentStatusResult,
  getUserIntentStatus,
} from "../../actions/getUserIntentStatus.js";
import {
  type PrepareUserIntentResult,
  prepareUserIntent,
} from "../../actions/prepareUserIntent.js";
import {
  type SendUserIntentParameters,
  type SendUserIntentResult,
  sendUserIntent,
} from "../../actions/sendUserIntent.js";
import type {
  GetUserIntentReceiptParameters,
  GetUserIntentReceiptResult,
} from "../../actions/types.js";
import {
  type WaitForUserIntentExecutionReceiptParameters,
  type WaitForUserIntentExecutionReceiptReturnType,
  waitForUserIntentExecutionReceipt,
} from "../../actions/waitForUserIntentExecutionReceipt.js";
import {
  type WaitForUserIntentOpenReceiptParameters,
  type WaitForUserIntentOpenReceiptReturnType,
  waitForUserIntentOpenReceipt,
} from "../../actions/waitForUserIntentOpenReceipt.js";
import type { INTENT_VERSION_TYPE } from "../../types/intent.js";
import type { CombinedIntentRpcSchema } from "../intentClient.js";

export type IntentClientActions<
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
> = {
  getIntent: (parameters: GetIntentParameters) => Promise<GetIntentReturnType>;
  prepareUserIntent: <
    accountOverride extends SmartAccount | undefined = undefined,
    calls extends readonly unknown[] = readonly unknown[],
  >(
    parameters: Parameters<
      typeof prepareUserIntent<account, chain, accountOverride, calls>
    >[1],
  ) => Promise<PrepareUserIntentResult>;
  sendUserIntent: <
    accountOverride extends SmartAccount | undefined = undefined,
    calls extends readonly unknown[] = readonly unknown[],
  >(
    parameters: SendUserIntentParameters<account, accountOverride, calls>,
  ) => Promise<SendUserIntentResult>;
  getUserIntentStatus: (
    parameters: GetUserIntentStatusParameters,
  ) => Promise<GetUserIntentStatusResult>;
  getUserIntentOpenReceipt: (
    parameters: GetUserIntentReceiptParameters,
  ) => Promise<GetUserIntentReceiptResult>;
  getUserIntentExecutionReceipt: (
    parameters: GetUserIntentReceiptParameters,
  ) => Promise<GetUserIntentReceiptResult>;
  waitForUserIntentExecutionReceipt: (
    parameters: WaitForUserIntentExecutionReceiptParameters,
  ) => Promise<WaitForUserIntentExecutionReceiptReturnType>;
  waitForUserIntentOpenReceipt: (
    parameters: WaitForUserIntentOpenReceiptParameters,
  ) => Promise<WaitForUserIntentOpenReceiptReturnType>;
  enableIntent: () => Promise<EnableIntentResult>;
};

export function intentClientActions(
  version: INTENT_VERSION_TYPE,
): <
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
>(
  client: Client<transport, chain, account, CombinedIntentRpcSchema>,
) => IntentClientActions<chain, account> {
  return (client) => ({
    getIntent: (parameters) => getIntent(client, parameters, version),
    prepareUserIntent: (parameters) =>
      prepareUserIntent(client, parameters, version),
    sendUserIntent: (parameters) => sendUserIntent(client, parameters, version),
    getUserIntentStatus: (parameters) =>
      getUserIntentStatus(client, parameters, version),
    getUserIntentOpenReceipt: (parameters) =>
      getUserIntentOpenReceipt(client, parameters, version),
    getUserIntentExecutionReceipt: (parameters) =>
      getUserIntentExecutionReceipt(client, parameters, version),
    waitForUserIntentExecutionReceipt: (parameters) =>
      waitForUserIntentExecutionReceipt(client, parameters, version),
    waitForUserIntentOpenReceipt: (parameters) =>
      waitForUserIntentOpenReceipt(client, parameters, version),
    enableIntent: () => enableIntent(client, version),
  });
}
