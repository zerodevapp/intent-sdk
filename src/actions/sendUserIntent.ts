import type { Address, Chain, Client, Hex, Transport } from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import {
  keccak256,
  encodeAbiParameters,
  parseAbiParameters,
  parseErc6492Signature,
  toHex,
  concatHex,
  pad,
  concat,
} from "viem";
import type { CabRpcSchema } from "../client/cabClient.js";
import type { PrepareUserIntentParameters } from "./prepareUserIntent.js";
import { prepareUserIntent } from "./prepareUserIntent.js";
import type {
  GaslessCrossChainOrder,
  GetIntentReturnType,
} from "./getIntent.js";
import {
  AccountNotFoundError,
  type KernelSmartAccountImplementation,
} from "@zerodev/sdk";
import { parseAccount } from "viem/utils";
import { MAGIC_VALUE_SIG_REPLAYABLE } from "@zerodev/sdk/constants";

export type SendUserIntentParameters<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  calls extends readonly unknown[] = readonly unknown[]
> = Partial<PrepareUserIntentParameters<account, accountOverride, calls>> & {
  intent?: GetIntentReturnType;
};

export type SendUserIntentResult = {
  uiHash: Hex;
};

export const getOrderHash = (order: GaslessCrossChainOrder): Hex => {
  return keccak256(
    encodeAbiParameters(
      parseAbiParameters("address, uint32, uint32, bytes32, bytes32"),
      [
        order.user,
        order.openDeadline,
        order.fillDeadline,
        order.orderDataType,
        keccak256(order.orderData),
      ]
    )
  );
};

export const getChainAgnosticTypeHash = (intentHash: Hex, account: Address) => {
  const KERNEL_WRAPPER_TYPE_HASH =
    "0x1547321c374afde8a591d972a084b071c594c275e36724931ff96c25f2999c83";
  const structHash = keccak256(
    encodeAbiParameters(parseAbiParameters("bytes32, bytes32"), [
      KERNEL_WRAPPER_TYPE_HASH,
      intentHash,
    ])
  );
  const nameHash = keccak256(toHex("Kernel"));
  const versionHash = keccak256(toHex("0.3.2"));

  const separator = keccak256(
    concatHex([
      "0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f",
      nameHash,
      versionHash,
      toHex(0, { size: 32 }),
      pad(account, { size: 32 }),
    ])
  );

  const typeData = concatHex(["0x1901", separator, structHash]);
  const typeHash = keccak256(typeData);

  return typeHash;
};

export async function sendUserIntent<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = undefined,
  calls extends readonly unknown[] = readonly unknown[]
>(
  client: Client<transport, chain, account, CabRpcSchema>,
  parameters: SendUserIntentParameters<account, accountOverride, calls>
): Promise<SendUserIntentResult> {
  const {
    account: account_ = client.account,
    intent: existingIntent,
    ...prepareParams
  } = parameters;
  if (!account_) throw new AccountNotFoundError();

  const account = parseAccount(
    account_
  ) as unknown as SmartAccount<KernelSmartAccountImplementation>;

  // Get or prepare the order
  const intent =
    existingIntent ??
    (await prepareUserIntent(
      client,
      prepareParams as PrepareUserIntentParameters<
        account,
        accountOverride,
        calls
      >
    ));

  // Get the order hash
  const orderHash = getOrderHash(intent.order);
  console.log(orderHash);
  const typeHash = getChainAgnosticTypeHash(orderHash, account.address);

  // Sign the order hash
  if (!client.account) throw new Error("Account not found");
  const signature = await account.kernelPluginManager.signMessage({
    message: { raw: typeHash },
  });
  console.log(signature);
  let { signature: signature_ } = parseErc6492Signature(signature);
  console.log(signature_);
  signature_ = concat([
    toHex(0, { size: 1 }),
    MAGIC_VALUE_SIG_REPLAYABLE,
    signature_,
  ]);

  // Send the signed order to the relayer
  const result = await client.request({
    method: "rl_sendUserIntent",
    params: [
      {
        order: intent.order,
        signature: signature_,
        fillerData: intent.fillerData,
      },
    ],
  });

  return result as SendUserIntentResult;
}
