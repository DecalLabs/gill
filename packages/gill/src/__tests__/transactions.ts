import {
  blockhash,
  generateKeyPairSigner,
  type KeyPairSigner,
} from "@solana/kit";
import { createTransaction } from "../core/create-transaction";
import { hasSetComputeLimitInstruction } from "../programs/compute-budget/utils";

describe("sendAndConfirmTransaction configuration", () => {
  let signer: KeyPairSigner;

  beforeAll(async () => {
    signer = await generateKeyPairSigner();
  });

  test("works with transactions missing blockhash", () => {
    const transaction = createTransaction({
      feePayer: signer,
      instructions: [],
    });

    // Transaction created without blockhash should be missing lifetime constraint
    expect("lifetimeConstraint" in transaction).toBe(false);
  });

  test("works with transactions missing compute units", () => {
    const transaction = createTransaction({
      feePayer: signer,
      instructions: [{
        programAddress: "11111111111111111111111111111112" as any,
        accounts: [],
        data: new Uint8Array([]),
      }],
    });

    // Transaction without compute unit limit should not have compute instruction
    expect(hasSetComputeLimitInstruction(transaction)).toBe(false);
  });

  test("preserves existing blockhash when present", () => {
    const transaction = createTransaction({
      feePayer: signer,
      instructions: [],
      latestBlockhash: {
        blockhash: blockhash("GK1nopeF3P8J46dGqq4KfaEWopZU7K65F6CKQXuUdr3z"),
        lastValidBlockHeight: 1000n,
      },
    });

    // Transaction with blockhash should have lifetime constraint
    expect("lifetimeConstraint" in transaction).toBe(true);
    expect(transaction.lifetimeConstraint.blockhash).toBe("GK1nopeF3P8J46dGqq4KfaEWopZU7K65F6CKQXuUdr3z");
  });

  test("preserves existing compute unit limit when present", () => {
    const transaction = createTransaction({
      feePayer: signer,
      instructions: [],
      computeUnitLimit: 200000,
    });

    // Transaction with compute limit should have compute instruction
    expect(hasSetComputeLimitInstruction(transaction)).toBe(true);
  });

  test("handles transactions with both blockhash and compute units", () => {
    const transaction = createTransaction({
      feePayer: signer,
      instructions: [],
      latestBlockhash: {
        blockhash: blockhash("GK1nopeF3P8J46dGqq4KfaEWopZU7K65F6CKQXuUdr3z"),
        lastValidBlockHeight: 1000n,
      },
      computeUnitLimit: 200000,
    });

    expect("lifetimeConstraint" in transaction).toBe(true);
    expect(hasSetComputeLimitInstruction(transaction)).toBe(true);
  });

  test("createTransaction defaults version to legacy", () => {
    const transaction = createTransaction({
      feePayer: signer,
      instructions: [],
    });

    expect(transaction.version).toBe("legacy");
  });

  test("createTransaction accepts explicit version", () => {
    const transaction = createTransaction({
      feePayer: signer,
      instructions: [],
      version: 0,
    });

    expect(transaction.version).toBe(0);
  });
});

describe("prepareTransaction logic verification", () => {
  let signer: KeyPairSigner;

  beforeAll(async () => {
    signer = await generateKeyPairSigner();
  });

  test("identifies transactions that need blockhash preparation", () => {
    const transactionWithoutBlockhash = createTransaction({
      feePayer: signer,
      instructions: [],
    });

    const transactionWithBlockhash = createTransaction({
      feePayer: signer,
      instructions: [],
      latestBlockhash: {
        blockhash: blockhash("GK1nopeF3P8J46dGqq4KfaEWopZU7K65F6CKQXuUdr3z"),
        lastValidBlockHeight: 1000n,
      },
    });

    // Verify detection logic matches what sendAndConfirmTransaction uses
    const needsBlockhash1 = !("lifetimeConstraint" in transactionWithoutBlockhash);
    const needsBlockhash2 = !("lifetimeConstraint" in transactionWithBlockhash);

    expect(needsBlockhash1).toBe(true);
    expect(needsBlockhash2).toBe(false);
  });

  test("identifies transactions that need compute unit preparation", () => {
    const transactionWithoutCompute = createTransaction({
      feePayer: signer,
      instructions: [{
        programAddress: "11111111111111111111111111111112" as any,
        accounts: [],
        data: new Uint8Array([]),
      }],
    });

    const transactionWithCompute = createTransaction({
      feePayer: signer,
      instructions: [],
      computeUnitLimit: 200000,
    });

    // Verify detection logic matches what sendAndConfirmTransaction uses
    const needsComputeUnits1 = !hasSetComputeLimitInstruction(transactionWithoutCompute);
    const needsComputeUnits2 = !hasSetComputeLimitInstruction(transactionWithCompute);

    expect(needsComputeUnits1).toBe(true);
    expect(needsComputeUnits2).toBe(false);
  });

  test("correctly detects when both preparation steps are needed", () => {
    const transaction = createTransaction({
      feePayer: signer,
      instructions: [{
        programAddress: "11111111111111111111111111111112" as any,
        accounts: [],
        data: new Uint8Array([]),
      }],
    });

    const needsBlockhash = !("lifetimeConstraint" in transaction);
    const needsComputeUnits = !hasSetComputeLimitInstruction(transaction);

    expect(needsBlockhash).toBe(true);
    expect(needsComputeUnits).toBe(true);
  });

  test("correctly detects when no preparation is needed", () => {
    const transaction = createTransaction({
      feePayer: signer,
      instructions: [],
      latestBlockhash: {
        blockhash: blockhash("GK1nopeF3P8J46dGqq4KfaEWopZU7K65F6CKQXuUdr3z"),
        lastValidBlockHeight: 1000n,
      },
      computeUnitLimit: 200000,
    });

    const needsBlockhash = !("lifetimeConstraint" in transaction);
    const needsComputeUnits = !hasSetComputeLimitInstruction(transaction);

    expect(needsBlockhash).toBe(false);
    expect(needsComputeUnits).toBe(false);
  });
});