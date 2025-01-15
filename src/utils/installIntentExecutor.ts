import { KernelV3_1AccountAbi } from "@zerodev/sdk";
import type { PluginMigrationData } from "@zerodev/sdk/types";
import {
  type Address,
  concatHex,
  encodeAbiParameters,
  encodeFunctionData,
  parseAbiParameters,
  zeroAddress,
} from "viem";
import type { UserOperationCall } from "viem/account-abstraction";
import { IntentVersionToAddressesMap } from "../config/constants.js";
import type { INTENT_VERSION_TYPE } from "../types/intent.js";

export const installIntentExecutor = (version: INTENT_VERSION_TYPE) =>
  encodeFunctionData({
    abi: KernelV3_1AccountAbi,
    functionName: "installModule",
    args: [
      BigInt(2),
      IntentVersionToAddressesMap[version].intentExecutorAddress,
      concatHex([
        zeroAddress,
        encodeAbiParameters(parseAbiParameters(["bytes", "bytes"]), [
          "0x",
          "0x",
        ]),
      ]),
    ],
  });

export const getInstallIntentExecutorCall = ({
  accountAddress,
  version,
}: {
  accountAddress: Address;
  version: INTENT_VERSION_TYPE;
}): UserOperationCall => {
  return {
    to: accountAddress,
    data: installIntentExecutor(version),
    value: 0n,
  };
};

export const getIntentExecutorPluginData = (
  version: INTENT_VERSION_TYPE,
): PluginMigrationData => {
  return {
    type: 2,
    address: IntentVersionToAddressesMap[version].intentExecutorAddress,
    data: concatHex([
      zeroAddress,
      encodeAbiParameters(parseAbiParameters(["bytes", "bytes"]), ["0x", "0x"]),
    ]),
  };
};
