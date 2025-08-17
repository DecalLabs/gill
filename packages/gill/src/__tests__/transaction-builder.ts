import assert from "node:assert";

import {
  generateKeyPairSigner,
  lamports,
  type KeyPairSigner,
  type Instruction,
  type MicroLamports,
} from "@solana/kit";
import {
  getTransferSolInstruction,
  getAddMemoInstruction
} from "../programs";
import { TransactionBuilder } from "../core/transaction-builder";
import { createSolanaClient } from "../core/create-solana-client";
import type { SolanaClient } from "../types/rpc";

const DEFAULTS = {
  computeLimit: 200_000,
  priorityFee: 1n,
}

describe("TransactionBuilder", () => {
  let feePayer: KeyPairSigner;
  let recipient: KeyPairSigner;
  let mockClient: SolanaClient;
  let transferInstruction: Instruction;
  let memoInstruction: Instruction;

  beforeAll(async () => {
    feePayer = await generateKeyPairSigner();
    recipient = await generateKeyPairSigner();

    mockClient = createSolanaClient({
      urlOrMoniker: "localnet",
    });

    transferInstruction = getTransferSolInstruction({
      source: feePayer,
      destination: recipient.address,
      amount: lamports(1_000_000n),
    });

    memoInstruction = getAddMemoInstruction({
      memo: "Hello, world!",
    });
  });

  describe("constructor", () => {
    test("creates a builder with default configuration", () => {
      const builder = new TransactionBuilder({
        client: mockClient,
        feePayer,
      });

      const config = builder.getConfig();
      assert.equal(config.feePayer, feePayer.address);
      assert.equal(config.computeLimit, DEFAULTS.computeLimit);
      assert.equal(config.priorityFee, DEFAULTS.priorityFee);
      assert.equal(config.instructions.length, 0);
      assert.equal(config.isPrepared, false);
      assert.equal(config.version, 'legacy');
    });

    test("creates a builder with custom configuration", () => {
      const computeLimit = 200_000;
      const priorityFee = 5000n as MicroLamports;
      const builder = new TransactionBuilder({
        client: mockClient,
        feePayer,
        computeLimit,
        priorityFee,
        version: 0,
      });

      const config = builder.getConfig();
      assert.equal(config.computeLimit, computeLimit);
      assert.equal(config.priorityFee, priorityFee);
      assert.equal(config.version, 0);
    });

    test("static create method works", () => {
      const builder = TransactionBuilder.create({
        client: mockClient,
        feePayer,
      });

      assert.ok(builder instanceof TransactionBuilder);
    });
  });

  describe("add instructions", () => {
    test("adds a single instruction", () => {
      const builder = new TransactionBuilder({
        client: mockClient,
        feePayer,
      });

      builder.add(transferInstruction);
      assert.equal(builder.getConfig().instructions.length, 1);
    });

    test("adds multiple instructions with addMany", () => {
      const builder = new TransactionBuilder({
        client: mockClient,
        feePayer,
      });

      const instructions = [transferInstruction, memoInstruction];
      builder.addMany(instructions);
      assert.equal(builder.getConfig().instructions.length, 2);
      assert.equal(builder.getConfig().instructions[0], transferInstruction);
      assert.equal(builder.getConfig().instructions[1], memoInstruction);
    });

    test("supports method chaining", () => {
      const computeLimit = 200_000;
      const priorityFee = 1000n as MicroLamports;
      const beforeAddInstructions = new TransactionBuilder({
        client: mockClient,
        feePayer,
      });

      assert.equal(beforeAddInstructions.getConfig().instructions.length, 0);

      const beforeSetComputeAndPriorityFee = beforeAddInstructions
        .add(transferInstruction)
        .add(memoInstruction)

      assert.equal(beforeSetComputeAndPriorityFee.getConfig().instructions.length, 2);
      assert.equal(beforeSetComputeAndPriorityFee.getConfig().instructions[0], transferInstruction);
      assert.equal(beforeSetComputeAndPriorityFee.getConfig().instructions[1], memoInstruction);
      assert.equal(beforeSetComputeAndPriorityFee.getConfig().computeLimit, DEFAULTS.computeLimit);
      assert.equal(beforeSetComputeAndPriorityFee.getConfig().priorityFee, DEFAULTS.priorityFee);

      const afterSetComputeAndPriorityFee = beforeSetComputeAndPriorityFee
        .setComputeLimit(computeLimit)
        .setPriorityFee(priorityFee);

      assert.equal(afterSetComputeAndPriorityFee.getConfig().instructions.length, 2);
      assert.equal(afterSetComputeAndPriorityFee.getConfig().instructions[0], transferInstruction);
      assert.equal(afterSetComputeAndPriorityFee.getConfig().instructions[1], memoInstruction);
      assert.equal(afterSetComputeAndPriorityFee.getConfig().computeLimit, computeLimit);
      assert.equal(afterSetComputeAndPriorityFee.getConfig().priorityFee, priorityFee);
    });

    test("throws error when adding instructions after prepare", async () => {
      const builder = new TransactionBuilder({
        client: mockClient,
        feePayer,
      });

      builder.add(transferInstruction);

      // Mock the prepare method to avoid actual RPC calls
      builder["transactionMessage"] = {} as any;

      assert.throws(
        () => builder.add(transferInstruction),
        /Cannot add instructions after prepare/
      );
    });
  });

  describe("setters", () => {
    test("sets compute limit", () => {
      const builder = new TransactionBuilder({
        client: mockClient,
        feePayer,
      });

      builder.setComputeLimit(300_000);
      assert.equal(builder.getConfig().computeLimit, 300_000);
    });

    test("sets priority fee with different types", () => {
      const builder = new TransactionBuilder({
        client: mockClient,
        feePayer,
      });

      // Test with number
      builder.setPriorityFee(1000);
      assert.equal(builder.getConfig().priorityFee, 1000n);

      // Test with bigint
      builder.setPriorityFee(2000n);
      assert.equal(builder.getConfig().priorityFee, 2000n);

      // Test with MicroLamports
      builder.setPriorityFee(3000n as MicroLamports);
      assert.equal(builder.getConfig().priorityFee, 3000n);
    });

    test("throws error when modifying after prepare", () => {
      const builder = new TransactionBuilder({
        client: mockClient,
        feePayer,
      });

      builder["transactionMessage"] = {} as any;

      assert.throws(
        () => builder.setComputeLimit(200_000),
        /Cannot modify compute limit after prepare/
      );

      assert.throws(
        () => builder.setPriorityFee(1000n),
        /Cannot modify priority fee after prepare/
      );
    });

    test("throws error when setting compute limit to negative", () => {
      const builder = new TransactionBuilder({
        client: mockClient,
        feePayer,
      });

      assert.throws(
        () => builder.setComputeLimit(-1),
        /Compute limit cannot be negative/
      );
    });

    test("throws error when setting priority fee to negative", () => {
      const builder = new TransactionBuilder({
        client: mockClient,
        feePayer,
      });

      assert.throws(
        () => builder.setPriorityFee(-1n),
        /Priority fee cannot be negative/
      );
    });
  });

  describe("prepare", () => {
    test("throws error when no instructions added", async () => {
      const builder = new TransactionBuilder({
        client: mockClient,
        feePayer,
      });

      await assert.rejects(
        async () => await builder.prepare(),
        /Cannot prepare transaction with no instructions/
      );
    });

    test("throws error when already prepared", async () => {
      const builder = new TransactionBuilder({
        client: mockClient,
        feePayer,
      });

      builder.add(transferInstruction);
      builder["transactionMessage"] = {} as any;

      await assert.rejects(
        async () => await builder.prepare(),
        /Transaction has already been prepared/
      );
    });

  });

  describe("sign and send", () => {
    test("throws error when signing without prepare", async () => {
      const builder = new TransactionBuilder({
        client: mockClient,
        feePayer,
      });

      await assert.rejects(
        async () => await builder.sign(),
        /Transaction must be prepared before signing/
      );
    });

    test("throws error when sending without prepare", async () => {
      const builder = new TransactionBuilder({
        client: mockClient,
        feePayer,
      });

      await assert.rejects(
        async () => await builder.sendAndConfirm(),
        /Transaction must be prepared before sending/
      );
    });
  });

  describe("reset", () => {
    test("resets the builder state", () => {
      const builder = new TransactionBuilder({
        client: mockClient,
        feePayer,
      });

      builder.add(transferInstruction);
      builder.add(transferInstruction);
      assert.equal(builder.getConfig().instructions.length, 2);

      builder.reset();
      assert.equal(builder.getConfig().instructions.length, 0);
      assert.equal(builder.getConfig().isPrepared, false);
      assert.equal(builder.getTransactionMessage(), null);
    });

    test("allows reuse after reset", () => {
      const builder = new TransactionBuilder({
        client: mockClient,
        feePayer,
      });

      builder.add(transferInstruction);
      builder.reset();
      builder.add(transferInstruction);
      builder.add(memoInstruction);

      assert.equal(builder.getConfig().instructions.length, 2);
    });
  });

  describe("getTransactionMessage", () => {
    test("returns null when not prepared", () => {
      const builder = new TransactionBuilder({
        client: mockClient,
        feePayer,
      });

      assert.equal(builder.getTransactionMessage(), null);
    });

    test("returns transaction message when prepared", () => {
      const builder = new TransactionBuilder({
        client: mockClient,
        feePayer,
      });

      const mockMessage = { test: "message" } as any;
      builder["transactionMessage"] = mockMessage;

      assert.equal(builder.getTransactionMessage(), mockMessage);
    });
  });
});