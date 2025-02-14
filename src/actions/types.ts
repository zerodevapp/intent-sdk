import type { Hex, Log, TransactionReceipt } from "viem";

export type IntentExecutionReceipt = {
  intentHash: Hex;
  sender: Hex;
  relayer: Hex;
  executionChainId: Hex;
  logs: Log[];
  receipt: TransactionReceipt;
} | null;

export type IntentOpenReceipt = {
  intentHash: Hex;
  sender: Hex;
  relayer: Hex;
  executionChainId: Hex;
  openChainId: Hex;
  logs: Log[];
  receipt: TransactionReceipt;
} | null;

export type GetUserIntentReceiptParameters = {
  uiHash: Hex;
};

export type GetUserIntentExecutionReceiptResult = IntentExecutionReceipt;

export type GetUserIntentOpenReceiptResult = IntentOpenReceipt;
