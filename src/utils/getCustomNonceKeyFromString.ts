import { keccak256, slice, toHex } from "viem";

export const getCustomNonceKeyFromString = (input: string) => {
  const hash = keccak256(toHex(input));
  const truncatedHash = slice(hash, 0, 20);
  return BigInt(truncatedHash);
};
