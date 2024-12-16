// Note: This is a copied version of the poll function from viem. : https://github.com/wevm/viem/blob/aca3e1d75d979aa50f5737a2fabaf0088b160f46/src/utils/poll.ts

import type { ErrorType } from "../types/errors.js";

export async function wait(time: number) {
  return new Promise((res) => setTimeout(res, time));
}

type PollOptions<data> = {
  // Whether or not to emit when the polling starts.
  emitOnBegin?: boolean | undefined;
  // The initial wait time (in ms) before polling.
  // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
  initialWaitTime?: ((data: data | void) => Promise<number>) | undefined;
  // The interval (in ms).
  interval: number;
};

export type PollErrorType = ErrorType;

/**
 * @description Polls a function at a specified interval.
 */
export function poll<data>(
  // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
  fn: ({ unpoll }: { unpoll: () => void }) => Promise<data | void>,
  { emitOnBegin, initialWaitTime, interval }: PollOptions<data>,
) {
  let active = true;

  // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
  const unwatch = () => (active = false);

  const watch = async () => {
    // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
    let data: data | void = undefined;
    if (emitOnBegin) data = await fn({ unpoll: unwatch });

    const initialWait = (await initialWaitTime?.(data)) ?? interval;
    await wait(initialWait);

    const poll = async () => {
      if (!active) return;
      await fn({ unpoll: unwatch });
      await wait(interval);
      poll();
    };

    poll();
  };
  watch();

  return unwatch;
}
