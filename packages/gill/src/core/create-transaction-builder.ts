import {
  signTransactionMessageWithSigners,
  getSignatureFromTransaction,
  type CompilableTransactionMessage,
  type TransactionMessageWithBlockhashLifetime,
  type Instruction,
  type KeyPairSigner,
  type Signature,
  type MicroLamports,
  type Commitment,
  type FullySignedTransaction,
  TransactionVersion,
} from "@solana/kit";
import type { SolanaClient } from "../types/rpc";
import { debug } from "./debug";
import { createTransaction } from "./create-transaction";
import { prepareTransaction, type PrepareTransactionConfig } from "./prepare-transaction";

export interface FunctionalTransactionBuilderConfig {
  client: SolanaClient;
  feePayer: KeyPairSigner;
  computeLimit?: number;
  priorityFee?: MicroLamports | bigint | number;
  version?: TransactionVersion;
}

export interface FunctionalSimpleSendAndConfirmConfig {
  commitment?: Commitment;
  preflightCommitment?: Commitment;
  skipPreflight?: boolean;
  abortSignal?: AbortSignal;
}

interface TransactionBuilderState {
  readonly config: {
    client: SolanaClient;
    feePayer: KeyPairSigner;
    computeLimit: number;
    priorityFee: MicroLamports;
    version: TransactionVersion;
  };
  instructions: Instruction[];
  transactionMessage: (CompilableTransactionMessage & TransactionMessageWithBlockhashLifetime) | null;
  isPrepareCalled: boolean;
}

const DEFAULT_PREPARE_CONFIG = {
  computeUnitLimitMultiplier: 1.1,
  computeUnitLimitReset: true,
  blockhashReset: true,
};

const DEFAULT_COMPUTE_LIMIT = 200_000;
const DEFAULT_PRIORITY_FEE = 1n;
const DEFAULT_VERSION = 'legacy';

export interface FunctionalTransactionBuilder {
  add(instruction: Instruction): FunctionalTransactionBuilder;
  addMany(instructions: Instruction[]): FunctionalTransactionBuilder;
  setComputeLimit(limit: number): FunctionalTransactionBuilder;
  setPriorityFee(fee: MicroLamports | bigint | number): FunctionalTransactionBuilder;
  prepare(config?: Partial<PrepareTransactionConfig<CompilableTransactionMessage>>): Promise<FunctionalTransactionBuilder>;
  sign(): Promise<FullySignedTransaction>;
  sendAndConfirm(sendAndConfirmConfig?: FunctionalSimpleSendAndConfirmConfig): Promise<Signature>;
  prepareAndSendAndConfirm(
    sendAndConfirmConfig?: FunctionalSimpleSendAndConfirmConfig,
    prepareConfig?: Partial<PrepareTransactionConfig<CompilableTransactionMessage>>
  ): Promise<Signature>;
  getConfig(): {
    feePayer: string;
    computeLimit: number;
    priorityFee: MicroLamports;
    instructions: Instruction[];
    isPrepared: boolean;
    version: TransactionVersion;
  };
  reset(): FunctionalTransactionBuilder;
  getTransactionMessage(): (CompilableTransactionMessage & TransactionMessageWithBlockhashLifetime) | null;
}

function validateComputeLimit(limit: number): number {
  if (limit < 0) {
    throw new Error("Compute limit cannot be negative.");
  }
  return limit;
}

function getMicroLamports(value: MicroLamports | bigint | number): MicroLamports {
  if (typeof value === "number") {
    if (value < 0) {
      throw new Error("Priority fee cannot be negative.");
    }
    return BigInt(value) as MicroLamports;
  }
  if (value < 0n) {
    throw new Error("Priority fee cannot be negative.");
  }
  return value as MicroLamports;
}

function createInitialState(config: FunctionalTransactionBuilderConfig): TransactionBuilderState {
  return {
    config: {
      client: config.client,
      feePayer: config.feePayer,
      computeLimit: validateComputeLimit(config.computeLimit ?? DEFAULT_COMPUTE_LIMIT),
      priorityFee: getMicroLamports(config.priorityFee ?? DEFAULT_PRIORITY_FEE),
      version: config.version ?? DEFAULT_VERSION,
    },
    instructions: [],
    transactionMessage: null,
    isPrepareCalled: false,
  };
}

function createAddMethod(state: TransactionBuilderState, builder: FunctionalTransactionBuilder) {
  return function add(instruction: Instruction): FunctionalTransactionBuilder {
    if (state.transactionMessage) {
      throw new Error(
        "Cannot add instructions after prepare() has been called. Create a new TransactionBuilder or reset the builder."
      );
    }

    state.instructions.push(instruction);
    debug(`Added instruction to transaction. Total instructions: ${state.instructions.length}`, "debug");
    return builder;
  };
}

function createAddManyMethod(state: TransactionBuilderState, builder: FunctionalTransactionBuilder) {
  return function addMany(instructions: Instruction[]): FunctionalTransactionBuilder {
    if (state.transactionMessage) {
      throw new Error(
        "Cannot add instructions after prepare() has been called. Create a new TransactionBuilder or reset the builder."
      );
    }

    state.instructions.push(...instructions);
    debug(`Added ${instructions.length} instructions to transaction. Total: ${state.instructions.length}`, "debug");
    return builder;
  };
}

function createSetComputeLimitMethod(state: TransactionBuilderState, builder: FunctionalTransactionBuilder) {
  return function setComputeLimit(limit: number): FunctionalTransactionBuilder {
    if (state.transactionMessage) {
      throw new Error("Cannot modify compute limit after prepare() has been called.");
    }

    state.config.computeLimit = validateComputeLimit(limit);
    debug(`Set compute unit limit to ${limit}`, "debug");
    return builder;
  };
}

function createSetPriorityFeeMethod(state: TransactionBuilderState, builder: FunctionalTransactionBuilder) {
  return function setPriorityFee(fee: MicroLamports | bigint | number): FunctionalTransactionBuilder {
    if (state.transactionMessage) {
      throw new Error("Cannot modify priority fee after prepare() has been called.");
    }

    state.config.priorityFee = getMicroLamports(fee);
    debug(`Set priority fee to ${state.config.priorityFee} microlamports`, "debug");
    return builder;
  };
}

function createPrepareMethod(state: TransactionBuilderState, builder: FunctionalTransactionBuilder) {
  return async function prepare(config?: Partial<PrepareTransactionConfig<CompilableTransactionMessage>>): Promise<FunctionalTransactionBuilder> {
    if (state.instructions.length === 0) {
      throw new Error("Cannot prepare transaction with no instructions. Use add() to add instructions first.");
    }

    if (state.transactionMessage) {
      throw new Error(
        "Transaction has already been prepared. Create a new TransactionBuilder to build another transaction."
      );
    }

    debug(`Preparing transaction with ${state.instructions.length} instructions`, "info");

    let unpreparedTransaction = createTransaction({
      version: state.config.version,
      feePayer: state.config.feePayer,
      instructions: state.instructions,
      computeUnitLimit: state.config.computeLimit,
      computeUnitPrice: state.config.priorityFee,
    });

    const prepareConfig = {
      transaction: unpreparedTransaction,
      rpc: state.config.client.rpc,
      computeUnitLimitMultiplier: config?.computeUnitLimitMultiplier ?? DEFAULT_PREPARE_CONFIG.computeUnitLimitMultiplier,
      computeUnitLimitReset: config?.computeUnitLimitReset ?? DEFAULT_PREPARE_CONFIG.computeUnitLimitReset,
      blockhashReset: config?.blockhashReset ?? DEFAULT_PREPARE_CONFIG.blockhashReset,
    } as unknown as PrepareTransactionConfig<CompilableTransactionMessage>;

    state.transactionMessage = await prepareTransaction(prepareConfig);
    state.isPrepareCalled = true;
    debug("Transaction prepared successfully", "info");

    return builder;
  };
}

function createSignMethod(state: TransactionBuilderState) {
  return async function sign(): Promise<FullySignedTransaction> {
    if (!state.transactionMessage) {
      throw new Error("Transaction must be prepared before signing. Call prepare() first.");
    }

    debug("Signing transaction", "debug");
    const signedTransaction = await signTransactionMessageWithSigners(state.transactionMessage);
    const signature = getSignatureFromTransaction(signedTransaction);
    debug(`Transaction signed. Signature: ${signature}`, "info");

    return signedTransaction;
  };
}

function createSendAndConfirmMethod(state: TransactionBuilderState) {
  return async function sendAndConfirm(sendAndConfirmConfig?: FunctionalSimpleSendAndConfirmConfig): Promise<Signature> {
    const { commitment = "confirmed", preflightCommitment = "confirmed", skipPreflight = false, abortSignal } = sendAndConfirmConfig ?? {};
    if (!state.transactionMessage) {
      throw new Error("Transaction must be prepared before sending. Call prepare() first.");
    }

    debug("Sending and confirming transaction", "info");

    const signature = await state.config.client.sendAndConfirmTransaction(state.transactionMessage, {
      commitment,
      preflightCommitment,
      skipPreflight,
      abortSignal,
    });

    debug(`Transaction confirmed. ${signature}`, "info");

    return signature;
  };
}

function createPrepareAndSendAndConfirmMethod(_state: TransactionBuilderState, builder: FunctionalTransactionBuilder) {
  return async function prepareAndSendAndConfirm(
    sendAndConfirmConfig?: FunctionalSimpleSendAndConfirmConfig,
    prepareConfig?: Partial<PrepareTransactionConfig<CompilableTransactionMessage>>
  ): Promise<Signature> {
    await builder.prepare(prepareConfig);
    return builder.sendAndConfirm(sendAndConfirmConfig);
  };
}

function createGetConfigMethod(state: TransactionBuilderState) {
  return function getConfig(): {
    feePayer: string;
    computeLimit: number;
    priorityFee: MicroLamports;
    instructions: Instruction[];
    isPrepared: boolean;
    version: TransactionVersion;
  } {
    return {
      feePayer: state.config.feePayer.address,
      computeLimit: state.config.computeLimit,
      priorityFee: state.config.priorityFee,
      instructions: state.instructions,
      isPrepared: state.transactionMessage !== null,
      version: state.config.version,
    };
  };
}

function createResetMethod(state: TransactionBuilderState, builder: FunctionalTransactionBuilder) {
  return function reset(): FunctionalTransactionBuilder {
    state.instructions = [];
    state.transactionMessage = null;
    state.isPrepareCalled = false;
    debug("Transaction builder reset", "debug");
    return builder;
  };
}

function createGetTransactionMessageMethod(state: TransactionBuilderState) {
  return function getTransactionMessage(): (CompilableTransactionMessage & TransactionMessageWithBlockhashLifetime) | null {
    return state.transactionMessage;
  };
}

export function createTransactionBuilder(config: FunctionalTransactionBuilderConfig): FunctionalTransactionBuilder {
  const state = createInitialState(config);
  
  const builder: FunctionalTransactionBuilder = {} as FunctionalTransactionBuilder;
  
  // Create methods with access to state and builder
  builder.add = createAddMethod(state, builder);
  builder.addMany = createAddManyMethod(state, builder);
  builder.setComputeLimit = createSetComputeLimitMethod(state, builder);
  builder.setPriorityFee = createSetPriorityFeeMethod(state, builder);
  builder.prepare = createPrepareMethod(state, builder);
  builder.sign = createSignMethod(state);
  builder.sendAndConfirm = createSendAndConfirmMethod(state);
  builder.prepareAndSendAndConfirm = createPrepareAndSendAndConfirmMethod(state, builder);
  builder.getConfig = createGetConfigMethod(state);
  builder.reset = createResetMethod(state, builder);
  builder.getTransactionMessage = createGetTransactionMessageMethod(state);
  
  return builder;
}