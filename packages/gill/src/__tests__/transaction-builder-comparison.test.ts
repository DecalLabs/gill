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
import { createTransactionBuilder } from "../core/create-transaction-builder";
import { createSolanaClient } from "../core/create-solana-client";
import type { SolanaClient } from "../types/rpc";

describe("TransactionBuilder Comparison: Class vs Functional", () => {
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

  describe("API compatibility", () => {
    test("identical default configuration", () => {
      const config = { client: mockClient, feePayer };
      
      const classBuilder = new TransactionBuilder(config);
      const funcBuilder = createTransactionBuilder(config);
      
      const classConfig = classBuilder.getConfig();
      const funcConfig = funcBuilder.getConfig();
      
      assert.equal(classConfig.feePayer, funcConfig.feePayer);
      assert.equal(classConfig.computeLimit, funcConfig.computeLimit);
      assert.equal(classConfig.priorityFee, funcConfig.priorityFee);
      assert.equal(classConfig.instructions.length, funcConfig.instructions.length);
      assert.equal(classConfig.isPrepared, funcConfig.isPrepared);
      assert.equal(classConfig.version, funcConfig.version);
    });

    test("identical custom configuration", () => {
      const config = {
        client: mockClient,
        feePayer,
        computeLimit: 300_000,
        priorityFee: 2000n as MicroLamports,
        version: 0 as const,
      };
      
      const classBuilder = new TransactionBuilder(config);
      const funcBuilder = createTransactionBuilder(config);
      
      const classConfig = classBuilder.getConfig();
      const funcConfig = funcBuilder.getConfig();
      
      assert.equal(classConfig.computeLimit, funcConfig.computeLimit);
      assert.equal(classConfig.priorityFee, funcConfig.priorityFee);
      assert.equal(classConfig.version, funcConfig.version);
    });

    test("identical instruction adding behavior", () => {
      const config = { client: mockClient, feePayer };
      
      const classBuilder = new TransactionBuilder(config);
      const funcBuilder = createTransactionBuilder(config);
      
      // Add single instruction
      classBuilder.add(transferInstruction);
      funcBuilder.add(transferInstruction);
      
      assert.equal(classBuilder.getConfig().instructions.length, 1);
      assert.equal(funcBuilder.getConfig().instructions.length, 1);
      assert.equal(classBuilder.getConfig().instructions[0], transferInstruction);
      assert.equal(funcBuilder.getConfig().instructions[0], transferInstruction);
      
      // Add multiple instructions
      classBuilder.addMany([memoInstruction]);
      funcBuilder.addMany([memoInstruction]);
      
      assert.equal(classBuilder.getConfig().instructions.length, 2);
      assert.equal(funcBuilder.getConfig().instructions.length, 2);
    });

    test("identical chaining behavior", () => {
      const config = { client: mockClient, feePayer };
      
      const classBuilder = new TransactionBuilder(config);
      const funcBuilder = createTransactionBuilder(config);
      
      // Test method chaining
      const classResult = classBuilder
        .add(transferInstruction)
        .setComputeLimit(250_000)
        .setPriorityFee(1500n);
        
      const funcResult = funcBuilder
        .add(transferInstruction)
        .setComputeLimit(250_000)
        .setPriorityFee(1500n);
      
      // Both should return themselves for chaining
      assert.equal(classResult, classBuilder);
      assert.equal(funcResult, funcBuilder);
      
      // Configurations should be identical
      const classConfig = classBuilder.getConfig();
      const funcConfig = funcBuilder.getConfig();
      
      assert.equal(classConfig.computeLimit, funcConfig.computeLimit);
      assert.equal(classConfig.priorityFee, funcConfig.priorityFee);
      assert.equal(classConfig.instructions.length, funcConfig.instructions.length);
    });

    test("identical error messages for validation", () => {
      const config = { client: mockClient, feePayer };
      
      const classBuilder = new TransactionBuilder(config);
      const funcBuilder = createTransactionBuilder(config);
      
      // Test negative compute limit
      assert.throws(
        () => classBuilder.setComputeLimit(-1),
        /Compute limit cannot be negative/
      );
      assert.throws(
        () => funcBuilder.setComputeLimit(-1),
        /Compute limit cannot be negative/
      );
      
      // Test negative priority fee
      assert.throws(
        () => classBuilder.setPriorityFee(-1n),
        /Priority fee cannot be negative/
      );
      assert.throws(
        () => funcBuilder.setPriorityFee(-1n),
        /Priority fee cannot be negative/
      );
    });

    test("identical reset behavior", () => {
      const config = { client: mockClient, feePayer };
      
      const classBuilder = new TransactionBuilder(config);
      const funcBuilder = createTransactionBuilder(config);
      
      // Add instructions and modify settings
      classBuilder.add(transferInstruction).setComputeLimit(300_000);
      funcBuilder.add(transferInstruction).setComputeLimit(300_000);
      
      assert.equal(classBuilder.getConfig().instructions.length, 1);
      assert.equal(funcBuilder.getConfig().instructions.length, 1);
      
      // Reset both
      classBuilder.reset();
      funcBuilder.reset();
      
      const classConfig = classBuilder.getConfig();
      const funcConfig = funcBuilder.getConfig();
      
      assert.equal(classConfig.instructions.length, 0);
      assert.equal(funcConfig.instructions.length, 0);
      assert.equal(classConfig.isPrepared, false);
      assert.equal(funcConfig.isPrepared, false);
      assert.equal(classBuilder.getTransactionMessage(), null);
      assert.equal(funcBuilder.getTransactionMessage(), null);
    });

    test("identical error handling for prepare edge cases", async () => {
      const config = { client: mockClient, feePayer };
      
      // Test prepare with no instructions
      const classBuilder1 = new TransactionBuilder(config);
      const funcBuilder1 = createTransactionBuilder(config);
      
      await assert.rejects(
        () => classBuilder1.prepare(),
        /Cannot prepare transaction with no instructions/
      );
      await assert.rejects(
        () => funcBuilder1.prepare(),
        /Cannot prepare transaction with no instructions/
      );
    });

    test("identical error handling for sign/send without prepare", async () => {
      const config = { client: mockClient, feePayer };
      
      const classBuilder = new TransactionBuilder(config);
      const funcBuilder = createTransactionBuilder(config);
      
      // Test sign without prepare
      await assert.rejects(
        () => classBuilder.sign(),
        /Transaction must be prepared before signing/
      );
      await assert.rejects(
        () => funcBuilder.sign(),
        /Transaction must be prepared before signing/
      );
      
      // Test sendAndConfirm without prepare
      await assert.rejects(
        () => classBuilder.sendAndConfirm(),
        /Transaction must be prepared before sending/
      );
      await assert.rejects(
        () => funcBuilder.sendAndConfirm(),
        /Transaction must be prepared before sending/
      );
    });
  });

  describe("implementation differences", () => {
    test("class vs functional instantiation", () => {
      const config = { client: mockClient, feePayer };
      
      // Class instantiation
      const classBuilder = new TransactionBuilder(config);
      assert.ok(classBuilder instanceof TransactionBuilder);
      
      // Functional instantiation
      const funcBuilder = createTransactionBuilder(config);
      assert.ok(typeof funcBuilder === 'object');
      assert.ok('add' in funcBuilder);
      assert.ok('prepare' in funcBuilder);
      
      // Should not be instance of TransactionBuilder class
      assert.ok(!(funcBuilder instanceof TransactionBuilder));
    });

    test("static create method vs factory function", () => {
      const config = { client: mockClient, feePayer };
      
      // Class static method
      const classBuilder1 = TransactionBuilder.create(config);
      const classBuilder2 = new TransactionBuilder(config);
      
      // Both class approaches should create instances
      assert.ok(classBuilder1 instanceof TransactionBuilder);
      assert.ok(classBuilder2 instanceof TransactionBuilder);
      
      // Functional approach
      const funcBuilder = createTransactionBuilder(config);
      assert.ok(!(funcBuilder instanceof TransactionBuilder));
      
      // But all should have identical APIs
      assert.equal(typeof classBuilder1.add, 'function');
      assert.equal(typeof classBuilder2.add, 'function');
      assert.equal(typeof funcBuilder.add, 'function');
    });

    test("state isolation in functional version", () => {
      const config = { client: mockClient, feePayer };
      
      // Create multiple functional builders
      const funcBuilder1 = createTransactionBuilder(config);
      const funcBuilder2 = createTransactionBuilder(config);
      
      // Modify each independently
      funcBuilder1.add(transferInstruction).setComputeLimit(300_000);
      funcBuilder2.add(memoInstruction).setPriorityFee(2000n);
      
      // Should have isolated state
      const config1 = funcBuilder1.getConfig();
      const config2 = funcBuilder2.getConfig();
      
      assert.equal(config1.instructions.length, 1);
      assert.equal(config2.instructions.length, 1);
      assert.equal(config1.instructions[0], transferInstruction);
      assert.equal(config2.instructions[0], memoInstruction);
      assert.equal(config1.computeLimit, 300_000);
      assert.equal(config2.computeLimit, 200_000); // default
      assert.equal(config1.priorityFee, 1n); // default
      assert.equal(config2.priorityFee, 2000n);
    });
  });

  describe("memory and reference behavior", () => {
    test("method references are bound in functional version", () => {
      const config = { client: mockClient, feePayer };
      const funcBuilder = createTransactionBuilder(config);
      
      // Extract method reference
      const addMethod = funcBuilder.add;
      const getConfigMethod = funcBuilder.getConfig;
      
      // Should still work when called separately
      addMethod(transferInstruction);
      const configAfterAdd = getConfigMethod();
      
      assert.equal(configAfterAdd.instructions.length, 1);
      assert.equal(configAfterAdd.instructions[0], transferInstruction);
    });
  });
});