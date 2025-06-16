import type { KernelSmartAccountImplementation } from "@zerodev/sdk";
import type { SignedAuthorization } from "viem";
import type { SmartAccount } from "viem/account-abstraction";

export const getAuthorization = async (
  account: SmartAccount<KernelSmartAccountImplementation>,
): Promise<SignedAuthorization | undefined> => {
  if (!account.authorization) {
    return undefined;
  }
  return await account.eip7702Authorization?.();
};

export const get7702InitCalls = async (
  account: SmartAccount<KernelSmartAccountImplementation>,
) => {
  // get init call for 7702
  // const factoryArgs = await account.getFactoryArgs();
  // const initCalls7702: Call[] =
  //   factoryArgs.factoryData && factoryArgs.factory === "0x7702"
  //     ? [
  //         {
  //           to: account.address,
  //           data: factoryArgs.factoryData,
  //           value: 0n,
  //         },
  //       ]
  //     : [];
  const initCalls7702 = [
    {
      to: account.address,
      data: await account.generateInitCode(),
      value: 0n,
    },
  ];
  return initCalls7702;
};
