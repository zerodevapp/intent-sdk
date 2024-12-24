import { KernelV3_1AccountAbi } from "@zerodev/sdk";
import {
  type Address,
  concatHex,
  encodeAbiParameters,
  encodeFunctionData,
  parseAbiParameters,
  zeroAddress,
} from "viem";
import type { UserOperationCall } from "viem/account-abstraction";
import { INTENT_EXECUTOR } from "../config/constants.js";

export const installIntentExecutor = encodeFunctionData({
  abi: KernelV3_1AccountAbi,
  functionName: "installModule",
  args: [
    BigInt(2),
    INTENT_EXECUTOR,
    concatHex([
      zeroAddress,
      encodeAbiParameters(parseAbiParameters(["bytes", "bytes"]), ["0x", "0x"]),
    ]),
  ],
});

export const getInstallIntentExecutorCall = ({
  accountAddress,
}: {
  accountAddress: Address;
}): UserOperationCall => {
  return {
    to: accountAddress,
    data: installIntentExecutor,
    value: 0n,
  };
};
