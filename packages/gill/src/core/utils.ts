import {
  assertIsTransactionSigner,
  createNoopSigner,
  isTransactionSigner,
  type Address,
  type TransactionSigner,
} from "@solana/kit";
import type { SolanaClusterMoniker } from "../types";
import { GENESIS_HASH } from "./const";

/**
 * Determine the Solana moniker from its genesis hash
 *
 * If the hash is NOT known, returns `unknown`
 */
export function getMonikerFromGenesisHash(hash: string): SolanaClusterMoniker | "unknown" {
  switch (hash) {
    case GENESIS_HASH.mainnet:
      return "mainnet";
    case GENESIS_HASH.devnet:
      return "devnet";
    case GENESIS_HASH.testnet:
      return "testnet";
    default:
      return "unknown";
  }
}

export function checkedAddress<TAddress extends string = string>(
  input: Address<TAddress> | TransactionSigner<TAddress>,
): Address<TAddress> {
  return typeof input == "string" ? input : input.address;
}

export function checkedTransactionSigner<TAddress extends string = string>(
  input: Address<TAddress> | TransactionSigner<TAddress>,
): TransactionSigner<TAddress> {
  if (typeof input === "string" || "address" in input == false) input = createNoopSigner(input);
  if (!isTransactionSigner(input)) throw new Error("A signer or address is required");
  assertIsTransactionSigner(input);
  return input;
}

/**
 * Convert a lamport number to the human readable string of a SOL value
 * @param lamports - The amount in lamports
 * @param decimals - Number of decimal places to show (default: 9, max: 9)
 */
export function lamportsToSol(lamports: bigint | number, decimals: number = 9): string {
  const maxDecimals = Math.min(decimals, 9);
  const solValue = Number(lamports) / 1_000_000_000;
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: 0,
  }).format(solValue);
}
