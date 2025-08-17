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

export interface TransactionBuilderConfig {
  client: SolanaClient;
  feePayer: KeyPairSigner;
  computeLimit?: number;
  priorityFee?: MicroLamports | bigint | number;
  version?: TransactionVersion;
}

export interface SimpleSendAndConfirmConfig {
  commitment?: Commitment;
  preflightCommitment?: Commitment;
  skipPreflight?: boolean;
  abortSignal?: AbortSignal;
}

const DEFAULT_PREPARE_CONFIG = {
  computeUnitLimitMultiplier: 1.1,
  computeUnitLimitReset: true,
  blockhashReset: true,
};

const DEFAULT_COMPUTE_LIMIT = 200_000;
const DEFAULT_PRIORITY_FEE = 1n;
const DEFAULT_VERSION = 'legacy';


export class TransactionBuilder {
  private client: SolanaClient;
  private feePayer: KeyPairSigner;
  private instructions: Instruction[] = [];
  private computeLimit: number;
  private priorityFee: MicroLamports;
  private transactionMessage: (CompilableTransactionMessage & TransactionMessageWithBlockhashLifetime) | null = null;
  private version: TransactionVersion;

  constructor(config: TransactionBuilderConfig) {
    this.client = config.client;
    this.feePayer = config.feePayer;
    this.computeLimit = this.validateComputeLimit(config.computeLimit ?? DEFAULT_COMPUTE_LIMIT);
    this.priorityFee = this.getMicroLamports(config.priorityFee ?? DEFAULT_PRIORITY_FEE);
    this.version = config.version ?? DEFAULT_VERSION;
  }

  static create(config: TransactionBuilderConfig): TransactionBuilder {
    return new TransactionBuilder(config);
  }

  private getMicroLamports(value: MicroLamports | bigint | number): MicroLamports {
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

  add(instruction: Instruction): this {
    if (this.transactionMessage) {
      throw new Error(
        "Cannot add instructions after prepare() has been called. Create a new TransactionBuilder or reset the builder."
      );
    }

    this.instructions.push(instruction);
    debug(`Added instruction to transaction. Total instructions: ${this.instructions.length}`, "debug");
    return this;
  }

  addMany(instructions: Instruction[]): this {
    if (this.transactionMessage) {
      throw new Error(
        "Cannot add instructions after prepare() has been called. Create a new TransactionBuilder or reset the builder."
      );
    }

    this.instructions.push(...instructions);
    debug(`Added ${instructions.length} instructions to transaction. Total: ${this.instructions.length}`, "debug");
    return this;
  }

  setComputeLimit(limit: number): this {
    if (this.transactionMessage) {
      throw new Error("Cannot modify compute limit after prepare() has been called.");
    }

    this.computeLimit = this.validateComputeLimit(limit);
    debug(`Set compute unit limit to ${limit}`, "debug");
    return this;
  }

  private validateComputeLimit(limit: number): number {
    if (limit < 0) {
      throw new Error("Compute limit cannot be negative.");
    }
    return limit;
  }

  setPriorityFee(fee: MicroLamports | bigint | number): this {
    if (this.transactionMessage) {
      throw new Error("Cannot modify priority fee after prepare() has been called.");
    }

    this.priorityFee = this.getMicroLamports(fee);
    debug(`Set priority fee to ${this.priorityFee} microlamports`, "debug");
    return this;
  }

  async prepare(config?: Partial<PrepareTransactionConfig<CompilableTransactionMessage>>): Promise<this> {
    if (this.instructions.length === 0) {
      throw new Error("Cannot prepare transaction with no instructions. Use add() to add instructions first.");
    }

    if (this.transactionMessage) {
      throw new Error(
        "Transaction has already been prepared. Create a new TransactionBuilder to build another transaction."
      );
    }

    debug(`Preparing transaction with ${this.instructions.length} instructions`, "info");

    let unpreparedTransaction = createTransaction({
      version: this.version,
      feePayer: this.feePayer,
      instructions: this.instructions,
      computeUnitLimit: this.computeLimit,
      computeUnitPrice: this.priorityFee,
    });

    const prepareConfig = {
      transaction: unpreparedTransaction,
      rpc: this.client.rpc,
      computeUnitLimitMultiplier: config?.computeUnitLimitMultiplier ?? DEFAULT_PREPARE_CONFIG.computeUnitLimitMultiplier,
      computeUnitLimitReset: config?.computeUnitLimitReset ?? DEFAULT_PREPARE_CONFIG.computeUnitLimitReset,
      blockhashReset: config?.blockhashReset ?? DEFAULT_PREPARE_CONFIG.blockhashReset,
    } as unknown as PrepareTransactionConfig<CompilableTransactionMessage>;

    this.transactionMessage = await prepareTransaction(prepareConfig);
    debug("Transaction prepared successfully", "info");

    return this;
  }

  async sign(): Promise<FullySignedTransaction> {
    if (!this.transactionMessage) {
      throw new Error("Transaction must be prepared before signing. Call prepare() first.");
    }

    debug("Signing transaction", "debug");
    const signedTransaction = await signTransactionMessageWithSigners(this.transactionMessage);
    const signature = getSignatureFromTransaction(signedTransaction);
    debug(`Transaction signed. Signature: ${signature}`, "info");

    return signedTransaction;
  }

  async sendAndConfirm(sendAndConfirmConfig?: SimpleSendAndConfirmConfig): Promise<Signature> {
    const { commitment = "confirmed", preflightCommitment = "confirmed", skipPreflight = false, abortSignal } = sendAndConfirmConfig ?? {};
    if (!this.transactionMessage) {
      throw new Error("Transaction must be prepared before sending. Call prepare() first.");
    }

    debug("Sending and confirming transaction", "info");

    const signature = await this.client.sendAndConfirmTransaction(this.transactionMessage, {
      commitment,
      preflightCommitment,
      skipPreflight,
      abortSignal,
    });

    debug(`Transaction confirmed. ${signature}`, "info");

    return signature;
  }

  async prepareAndSendAndConfirm(
    sendAndConfirmConfig?: SimpleSendAndConfirmConfig,
    prepareConfig?: Partial<PrepareTransactionConfig<CompilableTransactionMessage>>
  ): Promise<Signature> {
    await this.prepare(prepareConfig);
    return this.sendAndConfirm(sendAndConfirmConfig);
  }

  getConfig(): {
    feePayer: string;
    computeLimit: number;
    priorityFee: MicroLamports;
    instructions: Instruction[];
    isPrepared: boolean;
    version: TransactionVersion;
  } {
    return {
      feePayer: this.feePayer.address,
      computeLimit: this.computeLimit,
      priorityFee: this.priorityFee,
      instructions: this.instructions,
      isPrepared: this.transactionMessage !== null,
      version: this.version,
    };
  }

  reset(): this {
    this.instructions = [];
    this.transactionMessage = null;
    debug("Transaction builder reset", "debug");
    return this;
  }

  getTransactionMessage(): (CompilableTransactionMessage & TransactionMessageWithBlockhashLifetime) | null {
    return this.transactionMessage;
  }
}