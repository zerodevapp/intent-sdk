import type { Chain, Client, Hex, Transport } from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import { stringify } from "viem/utils";
import type { CabRpcSchema } from "../client/cabClient.js";
import { observe } from "../utils/observe.js";
import { poll } from "../utils/poll.js";
import { getUserIntentExecutionReceipt } from "./getUserIntentExecutionReceipt.js";
import type { IntentReceipt } from "./types.js";

export type WaitForUserIntentExecutionReceiptTimeoutErrorType =
  WaitForUserIntentExecutionReceiptTimeoutError & {
    name: "WaitForUserIntentExecutionReceiptTimeoutError";
  };
export class WaitForUserIntentExecutionReceiptTimeoutError extends Error {
  constructor({ uiHash }: { uiHash: Hex }) {
    super(`Timed out waiting for user intent execution receipt: ${uiHash}`);
  }
}

export type WaitForUserIntentExecutionReceiptParameters = {
  /** The hash of the User Intent. */
  uiHash: Hex;
  /**
   * Polling frequency (in ms). Defaults to the client's pollingInterval config.
   * @default client.pollingInterval
   */
  pollingInterval?: number;
  /**
   * The number of times to retry.
   * @default 6
   */
  retryCount?: number;
  /** Optional timeout (in ms) to wait before stopping polling. */
  timeout?: number;
};

export type WaitForUserIntentExecutionReceiptReturnType = IntentReceipt;

/**
 * Waits for a User Intent execution receipt to be ready.
 *
 * - Polls {@link getUserIntentExecutionReceipt} on a specified interval.
 * - If the receipt is found, returns the receipt.
 * - If the receipt times out or exceeds retry count, throws an error.
 *
 * @param client - Client to use
 * @param parameters - {@link WaitForUserIntentExecutionReceiptParameters}
 * @returns The execution receipt of the user intent. {@link WaitForUserIntentExecutionReceiptReturnType}
 *
 * @example
 * import { createCabClient, http } from '@zerodev/cab-sdk'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createCabClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 *
 * const receipt = await client.waitForUserIntentExecutionReceipt({
 *   uiHash: '0x...',
 * })
 */
export function waitForUserIntentExecutionReceipt<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
>(
  client: Client<transport, chain, account, CabRpcSchema>,
  parameters: WaitForUserIntentExecutionReceiptParameters,
): Promise<WaitForUserIntentExecutionReceiptReturnType> {
  const {
    uiHash,
    pollingInterval = client.pollingInterval,
    retryCount,
    timeout = 120_000,
  } = parameters;

  let count = 0;
  const observerId = stringify([
    "waitForUserIntentExecutionReceipt",
    client.uid,
    uiHash,
  ]);

  return new Promise((resolve, reject) => {
    const unobserve = observe(observerId, { resolve, reject }, (emit) => {
      const done = (fn: () => void) => {
        unpoll();
        fn();
        unobserve();
      };

      const unpoll = poll(
        async () => {
          if (retryCount && count >= retryCount)
            done(() =>
              emit.reject(
                new WaitForUserIntentExecutionReceiptTimeoutError({ uiHash }),
              ),
            );

          try {
            const receipt = await getUserIntentExecutionReceipt(client, {
              uiHash,
            });
            if (receipt) done(() => emit.resolve(receipt));
          } catch (err) {
            done(() => emit.reject(err));
          }

          count++;
        },
        {
          emitOnBegin: true,
          interval: pollingInterval,
        },
      );

      if (timeout)
        setTimeout(
          () =>
            done(() =>
              emit.reject(
                new WaitForUserIntentExecutionReceiptTimeoutError({ uiHash }),
              ),
            ),
          timeout,
        );

      return unpoll;
    });
  });
}
