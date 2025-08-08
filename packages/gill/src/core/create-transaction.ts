import type { Simplify } from "../types";

import { getSetComputeUnitLimitInstruction, getSetComputeUnitPriceInstruction } from "@solana-program/compute-budget";
import type {
  Address,
  TransactionMessageWithBlockhashLifetime,
  TransactionMessageWithFeePayer,
  TransactionMessageWithFeePayerSigner,
  TransactionSigner,
  TransactionVersion,
} from "@solana/kit";
import {
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  createTransactionMessage,
  isTransactionSigner,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
} from "@solana/kit";

import type { CreateTransactionInput, FullTransaction } from "../types/transactions";

/**
 * Simple interface for creating a Solana transaction
 */
export function createTransaction<TVersion extends TransactionVersion = "legacy", TFeePayer extends TransactionSigner = TransactionSigner>(
  props: CreateTransactionInput<TVersion, TFeePayer>,
): FullTransaction<TVersion, TransactionMessageWithFeePayerSigner>;
export function createTransaction<TVersion extends TransactionVersion = "legacy", TFeePayer extends Address = Address>(
  props: CreateTransactionInput<TVersion, TFeePayer>,
): FullTransaction<TVersion, TransactionMessageWithFeePayer>;
export function createTransaction<
  TVersion extends TransactionVersion = "legacy",
  TFeePayer extends TransactionSigner = TransactionSigner,
  TLifetimeConstraint extends TransactionMessageWithBlockhashLifetime["lifetimeConstraint"] = TransactionMessageWithBlockhashLifetime["lifetimeConstraint"],
>(
  props: CreateTransactionInput<TVersion, TFeePayer, TLifetimeConstraint>,
): Simplify<FullTransaction<TVersion, TransactionMessageWithFeePayerSigner, TransactionMessageWithBlockhashLifetime>>;
export function createTransaction<
  TVersion extends TransactionVersion = "legacy",
  TFeePayer extends Address = Address,
  TLifetimeConstraint extends TransactionMessageWithBlockhashLifetime["lifetimeConstraint"] = TransactionMessageWithBlockhashLifetime["lifetimeConstraint"],
>(
  props: CreateTransactionInput<TVersion, TFeePayer, TLifetimeConstraint>,
): Simplify<FullTransaction<TVersion, TransactionMessageWithFeePayer, TransactionMessageWithBlockhashLifetime>>;
export function createTransaction<
  TVersion extends TransactionVersion = "legacy",
  TFeePayer extends Address | TransactionSigner = Address | TransactionSigner,
  TLifetimeConstraint extends TransactionMessageWithBlockhashLifetime["lifetimeConstraint"] = TransactionMessageWithBlockhashLifetime["lifetimeConstraint"],
>(
  props: CreateTransactionInput<TVersion, TFeePayer, TLifetimeConstraint>,
): Simplify<FullTransaction<TVersion, TransactionMessageWithFeePayer, TransactionMessageWithBlockhashLifetime>>;
export function createTransaction<TVersion extends TransactionVersion = "legacy", TFeePayer extends Address | TransactionSigner = TransactionSigner>({
  version = "legacy" as TVersion,
  feePayer,
  instructions,
  latestBlockhash,
  computeUnitLimit,
  computeUnitPrice,
}: CreateTransactionInput<TVersion, TFeePayer>): FullTransaction<
  TVersion,
  TransactionMessageWithFeePayer | TransactionMessageWithFeePayerSigner
> {
  return pipe(
    createTransactionMessage({ version: version ?? ("legacy" as TVersion) }),
    (tx) => {
      const withLifetime = latestBlockhash ? setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx) : tx;
      if (typeof feePayer !== "string" && "address" in feePayer && isTransactionSigner(feePayer)) {
        return setTransactionMessageFeePayerSigner(feePayer, withLifetime);
      } else return setTransactionMessageFeePayer(feePayer, withLifetime);
    },
    (tx) => {
      const withComputeLimit =
        typeof computeUnitLimit !== "undefined"
          ? appendTransactionMessageInstruction(
              getSetComputeUnitLimitInstruction({ units: Number(computeUnitLimit) }),
              tx,
            )
          : tx;

      const withComputePrice =
        typeof computeUnitPrice !== "undefined"
          ? appendTransactionMessageInstruction(
              getSetComputeUnitPriceInstruction({ microLamports: Number(computeUnitPrice) }),
              withComputeLimit,
            )
          : withComputeLimit;

      return appendTransactionMessageInstructions(instructions, withComputePrice);
    },
  );
}
