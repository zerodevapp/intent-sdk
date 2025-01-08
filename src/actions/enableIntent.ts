import {
  type KernelSmartAccountImplementation,
  getUpgradeKernelCall,
} from "@zerodev/sdk";
import { getKernelImplementationAddress } from "@zerodev/sdk/actions";
import {
  KERNEL_V3_2,
  KernelVersionToAddressesMap,
} from "@zerodev/sdk/constants";
import type { Chain, Client, Hash, PublicClient, Transport } from "viem";
import { isAddressEqual } from "viem";
import {
  type SmartAccount,
  type UserOperationCall,
  sendUserOperation,
} from "viem/account-abstraction";
import { getAction } from "viem/utils";
import type { CombinedIntentRpcSchema } from "../client/intentClient.js";
import type { INTENT_VERSION_TYPE } from "../types/intent.js";
import { getInstallIntentExecutorCall } from "../utils/installIntentExecutor.js";

export type EnableIntentResult = Hash;

/**
 * Enables intent functionality upgrading the kernel to v3.2 (if needed)
 * and installing the intent executor.
 *
 * @param client - Client to use
 * @param parameters - {@link EnableIntentParameters}
 * @returns The transaction hash. {@link EnableIntentResult}
 */
export async function enableIntent<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
>(
  client: Client<transport, chain, account, CombinedIntentRpcSchema>,
  version: INTENT_VERSION_TYPE,
): Promise<EnableIntentResult> {
  if (!client.account) throw new Error("Account not found");
  const account =
    client.account as SmartAccount<KernelSmartAccountImplementation>;

  // @ts-expect-error
  const client_ = client?.client as PublicClient;
  if (!client_)
    throw new Error(
      "PublicClient not found ! Add it to the IntentClient using the client option",
    );

  // Get current kernel implementation
  const kernelImplementation = await getKernelImplementationAddress(client_, {
    address: account.address,
  });

  // Check if already using v3.2
  const isV32 = isAddressEqual(
    kernelImplementation,
    KernelVersionToAddressesMap[KERNEL_V3_2].accountImplementationAddress,
  );

  // Get calls
  const calls: UserOperationCall[] = [];

  // Add upgrade call if needed
  if (!isV32) {
    const upgradeCall = await getUpgradeKernelCall(account, KERNEL_V3_2);
    calls.push(upgradeCall);
  }

  // Add executor installation call
  const executorCall = await getInstallIntentExecutorCall({
    accountAddress: account.address,
    version,
  });
  calls.push(executorCall);

  // Send the user operation
  return getAction(
    client,
    sendUserOperation,
    "sendUserOperation",
  )({
    calls,
  });
}
