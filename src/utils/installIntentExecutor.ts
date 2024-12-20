import { KernelV3_1AccountAbi } from "@zerodev/sdk";
import {
  concatHex,
  encodeAbiParameters,
  encodeFunctionData,
  parseAbiParameters,
  zeroAddress,
} from "viem";
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
