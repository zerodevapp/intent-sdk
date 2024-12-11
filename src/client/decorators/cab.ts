import type { Chain, Client, Transport } from "viem";
import {
  getIntent,
  type GetIntentParameters,
  type GetIntentReturnType,
} from "../../actions/getIntent.js";
import {
  prepareUserIntent,
  type PrepareUserIntentResult,
} from "../../actions/prepareUserIntent.js";
import {
  sendUserIntent,
  type SendUserIntentParameters,
  type SendUserIntentResult,
} from "../../actions/sendUserIntent.js";
import {
  getUserIntentStatus,
  type GetUserIntentStatusParameters,
  type GetUserIntentStatusResult,
} from "../../actions/getUserIntentStatus.js";
import type { SmartAccount } from "viem/account-abstraction";
import type { CabRpcSchema } from "../cabClient.js";

export type CabClientActions<
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined
> = {
  getIntent: (parameters: GetIntentParameters) => Promise<GetIntentReturnType>;
  prepareUserIntent: <
    accountOverride extends SmartAccount | undefined = undefined,
    calls extends readonly unknown[] = readonly unknown[]
  >(
    parameters: Parameters<
      typeof prepareUserIntent<account, chain, accountOverride, calls>
    >[1]
  ) => Promise<PrepareUserIntentResult>;
  sendUserIntent: <
    accountOverride extends SmartAccount | undefined = undefined,
    calls extends readonly unknown[] = readonly unknown[]
  >(
    parameters: SendUserIntentParameters<account, accountOverride, calls>
  ) => Promise<SendUserIntentResult>;
  getUserIntentStatus: (parameters: GetUserIntentStatusParameters) => Promise<GetUserIntentStatusResult>;
};

export function cabClientActions(): <
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined
>(
  client: Client<transport, chain, account, CabRpcSchema>
) => CabClientActions<chain, account> {
  return (client) => ({
    getIntent: (parameters) => getIntent(client, parameters),
    prepareUserIntent: (parameters) => prepareUserIntent(client, parameters),
    sendUserIntent: (parameters) => sendUserIntent(client, parameters),
    getUserIntentStatus: (parameters) => getUserIntentStatus(client, parameters),
  });
}
