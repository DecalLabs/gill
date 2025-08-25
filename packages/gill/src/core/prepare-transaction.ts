import {
  setTransactionMessageLifetimeUsingBlockhash,
  assertIsTransactionMessageWithBlockhashLifetime,
} from "@solana/kit";
import type {
  CompilableTransactionMessage,
  GetLatestBlockhashApi,
  TransactionMessageWithFeePayer,
  Rpc,
  SimulateTransactionApi,
  TransactionMessage,
  TransactionMessageWithBlockhashLifetime,
  MicroLamports,
} from "@solana/kit";
import {
  hasSetComputeLimitInstruction,
  updateOrAppendSetComputeUnitLimitInstruction,
  updateOrAppendSetComputeUnitPriceInstruction,
  estimateComputeUnitLimitFactory,
  MAX_COMPUTE_UNIT_LIMIT,
} from "../programs/compute-budget";
import { transactionToBase64WithSigners } from "./base64-to-transaction";
import { debug, isDebugEnabled } from "./debug";

type PrepareCompilableTransactionMessage =
  | CompilableTransactionMessage
  | (TransactionMessageWithFeePayer & TransactionMessage);

export type PrepareTransactionConfig<TMessage extends PrepareCompilableTransactionMessage> = {
  /**
   * Transaction to prepare for sending to the blockchain
   */
  transaction: TMessage;
  /**
   * RPC client capable of simulating transactions and getting the latest blockhash
   **/
  rpc: Rpc<GetLatestBlockhashApi & SimulateTransactionApi>;
  /**
   * Multiplier applied to the simulated compute unit value obtained from simulation
   *
   * Default: `1.1`
   **/
  computeUnitLimitMultiplier?: number;
  /**
   * Whether or not you wish to force reset the compute unit limit value (if one is already set)
   * using the simulation response and `computeUnitLimitMultiplier`
   * (to avoid a simulation, you must set this to false and set a compute unit limit instruction before calling this function)
   **/
  computeUnitLimitReset?: boolean;
  /**
   * Priority fee to set for the transaction (in microlamports per compute unit)
   *
   * If not provided, no compute unit price instruction will be added
   **/
  computeUnitPrice?: MicroLamports | bigint | number;
  /**
   * Whether or not you wish to force reset the latest blockhash (if one is already set)
   *
   * Default: `true`
   **/
  blockhashReset?: boolean;
};

/**
 * Validate the prepare transaction config
 * @param config - The prepare transaction config
 * @throws Error if the config is invalid
 */
function validatePrepareTransactionConfig(config: PrepareTransactionConfig<any>) {
  if (config.computeUnitLimitMultiplier !== undefined && config.computeUnitLimitMultiplier <= 1) {
    throw new Error("computeUnitLimitMultiplier must be >= 1");
  }

  if (config.computeUnitPrice !== undefined) {
    const price =
      typeof config.computeUnitPrice === "bigint" ? config.computeUnitPrice : BigInt(config.computeUnitPrice);

    if (price < 0n) {
      throw new Error("computeUnitPrice must be >= 0");
    }
  }
}

/**
 * Prepare a Transaction to be signed and sent to the network. Including:
 * - setting a compute unit price (priority fee) if provided
 * - setting a compute unit limit (via simulation if needed)
 * - fetching the latest blockhash (if not already set)
 * - (optional) resetting latest blockhash to the most recent
 */
export async function prepareTransaction<TMessage extends PrepareCompilableTransactionMessage>(
  config: PrepareTransactionConfig<TMessage>,
): Promise<TMessage & TransactionMessageWithBlockhashLifetime> {
  validatePrepareTransactionConfig(config);
  // set the config defaults
  const computeUnitLimitMultiplier = config.computeUnitLimitMultiplier ?? 1.1;
  const blockhashReset = config.blockhashReset ?? true;

  let transaction = config.transaction;

  // Add compute unit price instruction if provided
  if (config.computeUnitPrice !== undefined) {
    const microLamports =
      typeof config.computeUnitPrice === "bigint"
        ? (config.computeUnitPrice as MicroLamports)
        : (BigInt(config.computeUnitPrice) as MicroLamports);

    transaction = updateOrAppendSetComputeUnitPriceInstruction(microLamports, transaction) as TMessage;
  }

  // Check if transaction already has a compute unit limit instruction
  const hasComputeUnitLimit = hasSetComputeLimitInstruction(transaction);

  // Determine if we should estimate compute units
  const shouldEstimate = config.computeUnitLimitReset || !hasComputeUnitLimit;

  if (shouldEstimate) {
    // Use estimateComputeUnitLimitFactory which handles provisional blockhash and max CU for simulation
    const estimateComputeUnitLimit = estimateComputeUnitLimitFactory({ rpc: config.rpc });
    const consumedUnits = await estimateComputeUnitLimit(transaction);
    // Calculate compute units with multiplier
    const estimatedUnits = Math.ceil(consumedUnits * computeUnitLimitMultiplier);
    // Ensure our multiplier doesn't exceed the max compute unit limit
    const finalUnits = Math.min(estimatedUnits, MAX_COMPUTE_UNIT_LIMIT);
    debug(`Compute units - consumed: ${consumedUnits}, estimated: ${estimatedUnits}, final: ${finalUnits}`, "debug");
    // Update transaction with estimated compute units
    transaction = updateOrAppendSetComputeUnitLimitInstruction(finalUnits, transaction) as TMessage;
  }

  // Update the latest blockhash
  const shouldResetBlockhash = blockhashReset || !("lifetimeConstraint" in transaction);
  if (shouldResetBlockhash) {
    const { value: latestBlockhash } = await config.rpc.getLatestBlockhash().send();
    debug("Resetting the latest blockhash.", "debug");
    transaction = setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, transaction) as TMessage &
      TransactionMessageWithBlockhashLifetime;
  }

  assertIsTransactionMessageWithBlockhashLifetime(transaction);

  // Log base64 transaction if debugging is enabled
  if (isDebugEnabled()) {
    debug(`Transaction as base64: ${await transactionToBase64WithSigners(transaction)}`, "debug");
  }

  return transaction;
}
