import {
  AccountNotFoundError,
  type KernelSmartAccountImplementation,
} from "@zerodev/sdk";
import type { Chain, Client, Hex, Transport } from "viem";
import {
  encodeAbiParameters,
  keccak256,
  parseAbiParameters,
  parseErc6492Signature,
} from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import { parseAccount } from "viem/utils";
import type { CombinedIntentRpcSchema } from "../client/intentClient.js";
import type {
  GaslessCrossChainOrder,
  GetIntentReturnType,
} from "./getIntent.js";
import type { PrepareUserIntentParameters } from "./prepareUserIntent.js";
import { prepareUserIntent } from "./prepareUserIntent.js";
import { SAME_CHAIN_ORDER_DATA_TYPE } from "../config/constants.js";

export type SendUserIntentParameters<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  calls extends readonly unknown[] = readonly unknown[],
> = Partial<PrepareUserIntentParameters<account, accountOverride, calls>> & {
  intent?: GetIntentReturnType;
};

export type SendUserIntentResult = {
  uiHash: Hex;
};

export const getOrderHash = (order: GaslessCrossChainOrder): Hex => {
  if (
    order.orderDataType.toLowerCase() ===
    SAME_CHAIN_ORDER_DATA_TYPE.toLowerCase()
  ) {
    return keccak256(
      encodeAbiParameters(
        parseAbiParameters(
          "address, uint256, uint32, uint32, bytes32, bytes32",
        ),
        [
          order.user,
          order.nonce,
          order.openDeadline,
          order.fillDeadline,
          order.orderDataType,
          keccak256(order.orderData),
        ],
      ),
    );
  }
  return keccak256(
    encodeAbiParameters(
      parseAbiParameters("address, uint32, uint32, bytes32, bytes32"),
      [
        order.user,
        order.openDeadline,
        order.fillDeadline,
        order.orderDataType,
        keccak256(order.orderData),
      ],
    ),
  );
};

export async function sendUserIntent<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = undefined,
  calls extends readonly unknown[] = readonly unknown[],
>(
  client: Client<transport, chain, account, CombinedIntentRpcSchema>,
  parameters: SendUserIntentParameters<account, accountOverride, calls>,
): Promise<SendUserIntentResult> {
  const {
    account: account_ = client.account,
    intent: existingIntent,
    ...prepareParams
  } = parameters;
  if (!account_) throw new AccountNotFoundError();

  const account = parseAccount(
    account_,
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
      >,
    ));

  // Get the order hash
  const orderHash = getOrderHash(intent.order);

  // Sign the order hash
  if (!client.account) throw new Error("Account not found");
  const signature = await account.signMessage({
    message: { raw: orderHash },
    useReplayableSignature: true,
  });
  const { signature: signature_ } = parseErc6492Signature(signature);

  // Send the signed order to the relayer
  const result = await client.request({
    method: "rl_sendUserIntent",
    params: [
      {
        order: intent.order,
        signature: signature_,
      },
    ],
  });

  return result as SendUserIntentResult;
}
