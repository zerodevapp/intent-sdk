import type { KernelSmartAccountImplementation } from "@zerodev/sdk";
import type { SignedAuthorization } from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import * as allChains from "viem/chains";

export const getAuthorization = async (
  account: SmartAccount<KernelSmartAccountImplementation>,
  chainId?: number,
): Promise<SignedAuthorization | undefined> => {
  if (!account.authorization) {
    return undefined;
  }
  const chain = chainId
    ? Object.values(allChains).find((chain) => chain.id === chainId)
    : undefined;
  return await account.eip7702Authorization?.({
    useReplayableSignature: true,
    chain,
  });
};

export const get7702InitCalls = async (
  account: SmartAccount<KernelSmartAccountImplementation>,
) => {
  const initCalls7702 = [
    {
      to: account.address,
      data: await account.generateInitCode(),
      value: 0n,
    },
  ];
  return initCalls7702;
};
