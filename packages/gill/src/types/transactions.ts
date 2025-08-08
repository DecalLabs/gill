import type {
  Address,
  BaseTransactionMessage,
  Instruction,
  TransactionMessageWithBlockhashLifetime,
  TransactionMessageWithFeePayer,
  TransactionMessageWithFeePayerSigner,
  TransactionSigner,
  TransactionVersion,
} from "@solana/kit";
import type { Simplify } from ".";

export type CreateTransactionInput<
  TVersion extends TransactionVersion = "legacy",
  TFeePayer extends Address | TransactionSigner = TransactionSigner,
  TLifetimeConstraint extends TransactionMessageWithBlockhashLifetime["lifetimeConstraint"] | undefined = undefined,
> = {
  /**
   * Transaction version (default: "legacy")
   * - `legacy` is commonly used
   * - `0` is needed for use with Address Lookup Tables
   *
   * @default `legacy`
   * */
  version?: TVersion;
  /** List of instructions for this transaction */
  instructions: Instruction[];
  /** Address or Signer that will pay transaction fees */
  feePayer: TFeePayer;
  /**
   * Latest blockhash (aka transaction lifetime) for this transaction to
   * accepted for execution on the Solana network
   * */
  latestBlockhash?: TLifetimeConstraint;
  /** Compute unit limit value to set on this transaction */
  computeUnitLimit?: number | bigint;
  /** Compute unit price (in micro-lamports) to set on this transaction */
  computeUnitPrice?: number | bigint;
};

export type FullTransaction<
  TVersion extends TransactionVersion,
  TFeePayer extends TransactionMessageWithFeePayer | TransactionMessageWithFeePayerSigner,
  TBlockhashLifetime extends TransactionMessageWithBlockhashLifetime | undefined = undefined,
> = Simplify<
  BaseTransactionMessage<TVersion> &
    TFeePayer &
    (TBlockhashLifetime extends TransactionMessageWithBlockhashLifetime ? TransactionMessageWithBlockhashLifetime : {})
>;
