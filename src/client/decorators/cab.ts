import type { Client } from "viem";
import { getIntent } from "../../actions/getIntent.js";
import { prepareUserIntent } from "../../actions/prepareUserIntent.js";
import type { CabClientActions } from "../../types/actions.js";
import type { CabClient } from "../cabClient.js";

export function cabClientActions(): (client: Client) => CabClientActions {
  return (client) => ({
    getIntent: (parameters) => getIntent(client as CabClient, parameters),
    prepareUserIntent: (parameters) =>
      prepareUserIntent(client as CabClient, parameters),
  });
}
