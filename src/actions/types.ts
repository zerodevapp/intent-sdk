import type { Hex, Log, TransactionReceipt } from "viem";

export type IntentReceipt = {
  intentHash: Hex;
  sender: Hex;
  relayer: Hex;
  executionChainId: Hex;
  logs: Log[];
  receipt: TransactionReceipt;
} | null;

export type GetUserIntentReceiptParameters = {
  uiHash: Hex;
};

export type GetUserIntentReceiptResult = IntentReceipt;
