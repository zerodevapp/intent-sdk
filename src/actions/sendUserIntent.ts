import {
  type Transaction,
  type TransactionPartialSigner,
  getBase64EncodedWireTransaction,
  getTransactionDecoder,
} from "@solana/kit";
import { type Rpc, type SolanaRpcApi } from "@solana/kit";
import { MULTI_CHAIN_ECDSA_VALIDATOR_ADDRESS } from "@zerodev/multi-chain-ecdsa-validator";
import {
  AccountNotFoundError,
  type KernelSmartAccountImplementation,
  eip712WrapHash,
} from "@zerodev/sdk";
import {
  MAGIC_VALUE_SIG_REPLAYABLE,
  VALIDATOR_TYPE,
} from "@zerodev/sdk/constants";
import { MerkleTree } from "merkletreejs";
import {
  type Chain,
  type Client,
  type Hex,
  type Transport,
  concatHex,
  hashMessage,
  isAddressEqual,
  isHex,
  slice,
  toBytes,
} from "viem";
import {
  encodeAbiParameters,
  keccak256,
  parseAbiParameters,
  parseErc6492Signature,
} from "viem";
import type { SmartAccount } from "viem/account-abstraction";
import { parseAccount } from "viem/utils";
import type { CombinedIntentRpcSchema } from "../client/intentClient.js";
import { V2_SAME_CHAIN_ORDER_DATA_TYPE } from "../config/constants.js";
import type { INTENT_VERSION_TYPE, UserIntentHash } from "../types/intent.js";
import { SOLANA_CHAIN_ID } from "../utils/constants.js";
import type {
  GaslessCrossChainOrder,
  GetIntentReturnType,
} from "./getIntent.js";
import type { PrepareUserIntentParameters } from "./prepareUserIntent.js";
import { prepareUserIntent } from "./prepareUserIntent.js";

export type SendUserIntentParameters<
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = SmartAccount | undefined,
  calls extends readonly unknown[] = readonly unknown[],
  SolanaRpc extends Rpc<SolanaRpcApi> | undefined =
    | Rpc<SolanaRpcApi>
    | undefined,
  SolanaSigner extends TransactionPartialSigner | undefined =
    | TransactionPartialSigner
    | undefined,
> = Partial<
  PrepareUserIntentParameters<
    account,
    accountOverride,
    calls,
    SolanaRpc,
    SolanaSigner
  >
> & {
  intent?: GetIntentReturnType;
  solanaSigner?: SolanaSigner;
  solanaRpc?: SolanaRpc;
};

export type RelayerSendUserIntentResult = {
  uiHash: Hex;
};

export type SendUserIntentResult = {
  inputsUiHash: UserIntentHash[];
  outputUiHash: UserIntentHash;
};

export const getOrderHash = (order: GaslessCrossChainOrder): Hex => {
  if (
    order.orderDataType.toLowerCase() ===
    V2_SAME_CHAIN_ORDER_DATA_TYPE.toLowerCase()
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

const signOrders = async (
  orders: GaslessCrossChainOrder[],
  account: SmartAccount<KernelSmartAccountImplementation>,
) => {
  // EVM signing
  const signOrderMultichain = async (orders: GaslessCrossChainOrder[]) => {
    const orderHashes = await Promise.all(
      orders
        .filter((order) => order.originChainId !== SOLANA_CHAIN_ID)
        .map(async (order) => {
          const orderHash = hashMessage({ raw: getOrderHash(order) });

          const wrappedMessageHash = await eip712WrapHash(
            orderHash,
            {
              name: "Kernel",
              chainId: BigInt(order.originChainId),
              version: account.kernelVersion,
              verifyingContract: account.address,
            },
            true, // replayable
          );
          return wrappedMessageHash;
        }),
    );
    const merkleTree = new MerkleTree(orderHashes, keccak256, {
      sortPairs: true,
    });

    const merkleRoot = merkleTree.getHexRoot() as Hex;
    const ecdsaSig = await account.kernelPluginManager.signMessage({
      message: {
        raw: merkleRoot,
      },
    });

    const encodeMerkleDataWithSig = (orderHash: Hex) => {
      const merkleProof = merkleTree.getHexProof(orderHash) as Hex[];
      const encodedMerkleProof = encodeAbiParameters(
        [{ name: "proof", type: "bytes32[]" }],
        [merkleProof],
      );
      return concatHex([ecdsaSig, merkleRoot, encodedMerkleProof]);
    };

    const signatures = orderHashes.map((orderHash) => {
      const signature = concatHex([
        VALIDATOR_TYPE.SUDO,
        MAGIC_VALUE_SIG_REPLAYABLE,
        encodeMerkleDataWithSig(orderHash),
      ]); // sudo
      const { signature: signature_ } = parseErc6492Signature(signature);
      return signature_;
    });
    return signatures;
  };

  const identifier = account.kernelPluginManager.getIdentifier();
  const sudoValidator = slice(identifier, 1);

  // multi-chain ecdsa validator
  if (isAddressEqual(sudoValidator, MULTI_CHAIN_ECDSA_VALIDATOR_ADDRESS)) {
    return signOrderMultichain(orders);
  }

  // other validators
  return await Promise.all(
    orders.map(async (order) => {
      const orderHash = getOrderHash(order);
      const signature = await account.signMessage({
        message: { raw: orderHash },
        useReplayableSignature: true,
      });
      const { signature: signature_ } = parseErc6492Signature(signature);
      return signature_;
    }),
  );
};

export async function sendUserIntent<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends SmartAccount | undefined = SmartAccount | undefined,
  accountOverride extends SmartAccount | undefined = undefined,
  calls extends readonly unknown[] = readonly unknown[],
  SolanaRpc extends Rpc<SolanaRpcApi> | undefined =
    | Rpc<SolanaRpcApi>
    | undefined,
  SolanaSigner extends TransactionPartialSigner | undefined =
    | TransactionPartialSigner
    | undefined,
>(
  client: Client<transport, chain, account, CombinedIntentRpcSchema>,
  parameters: SendUserIntentParameters<
    account,
    accountOverride,
    calls,
    SolanaRpc,
    SolanaSigner
  >,
  version: INTENT_VERSION_TYPE,
  solanaSigner: TransactionPartialSigner | undefined,
  solanaRpc: Rpc<SolanaRpcApi> | undefined,
): Promise<SendUserIntentResult> {
  const {
    account: account_ = client.account,
    intent: existingIntent,

    ...prepareParams
  } = parameters;
  if (!account_) throw new AccountNotFoundError();

  // only one of calls or instructions should be provided
  if (prepareParams.calls && prepareParams.instructions) {
    throw new Error(
      "Only one of calls or instructions should be provided in sendUserIntent",
    );
  }

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
        calls,
        SolanaRpc,
        SolanaSigner
      >,
      version,
      solanaSigner,
      solanaRpc,
    ));

  // Get the order hash
  if (intent.orders.length === 0) throw new Error("No orders found");

  // Sign the orders
  const signatures = await signOrders(intent.orders, account);

  // Add the signatures to the orders
  const ordersWithSig = intent.orders.map((order, index) => ({
    order,
    signature: signatures[index],
  }));

  // solana signature if executionTransaction is provided
  let solanaTx: Transaction | undefined;
  if (intent.executionTransaction && isHex(intent.executionTransaction)) {
    if (!solanaSigner) throw new Error("Solana signer is required");
    const bytesTransaction = toBytes(intent.executionTransaction);
    const transaction = getTransactionDecoder().decode(bytesTransaction);

    const [transactionSignatures] = await solanaSigner.signTransactions([
      transaction,
    ]);
    solanaTx = {
      ...transaction,
      signatures: Object.freeze({
        ...transaction.signatures,
        ...transactionSignatures,
      }),
    };
  }

  // Send the signed orders to the relayer
  const uiHashes = await Promise.all(
    ordersWithSig.map(async ({ order, signature }) => {
      return await client.request({
        method: "rl_sendUserIntent",
        params: [
          {
            order: order,
            signature,
            version,
            solanaTx: solanaTx
              ? getBase64EncodedWireTransaction(solanaTx)
              : undefined,
          },
        ],
      });
    }),
  );

  return {
    inputsUiHash: uiHashes.map((hash) => ({
      uiHash: hash.uiHash,
    })),
    outputUiHash: {
      uiHash: uiHashes[0].uiHash,
    },
  } as SendUserIntentResult;
}
