import assert from "node:assert";

import { blockhash, generateKeyPairSigner, isKeyPairSigner, type KeyPairSigner } from "@solana/kit";

import { createTransaction } from "../core";
import { hasSetComputeLimitInstruction, hasSetComputeUnitPriceInstruction } from "../programs";

describe("createTransaction", () => {
  let signer: KeyPairSigner;

  beforeAll(async () => {
    signer = await generateKeyPairSigner();
  });

  test("create a transaction without version (defaults to legacy)", () => {
    const tx = createTransaction({
      feePayer: signer,
      instructions: [],
    });

    assert.equal(tx.version, "legacy");
    assert.equal(tx.feePayer.address, signer.address);
    assert.equal(isKeyPairSigner(tx.feePayer), true);
    assert.equal(tx.instructions.length, 0);
    assert.equal(Object.hasOwn(tx, "lifetimeConstraint"), false);
    assert.equal(hasSetComputeUnitPriceInstruction(tx), false);
    assert.equal(hasSetComputeLimitInstruction(tx), false);
  });

  test("create a legacy transaction with a signer as the feePayer", () => {
    const tx = createTransaction({
      version: "legacy",
      feePayer: signer,
      instructions: [],
      latestBlockhash: {
        blockhash: blockhash("GK1nopeF3P8J46dGqq4KfaEWopZU7K65F6CKQXuUdr3z"),
        lastValidBlockHeight: 0n,
      },
    });

    assert.equal(tx.version, "legacy");
    assert.equal(tx.feePayer.address, signer.address);
    assert.equal(isKeyPairSigner(tx.feePayer), true);
    assert.equal(tx.instructions.length, 0);
    assert.equal(Object.hasOwn(tx, "lifetimeConstraint"), true);
    assert.equal(tx.lifetimeConstraint.blockhash, "GK1nopeF3P8J46dGqq4KfaEWopZU7K65F6CKQXuUdr3z");
    assert.equal(hasSetComputeUnitPriceInstruction(tx), false);
    assert.equal(hasSetComputeLimitInstruction(tx), false);
  });

  test("create a version 0 transaction with a signer as the feePayer", () => {
    const tx = createTransaction({
      version: 0,
      feePayer: signer,
      instructions: [],
    });

    assert.equal(tx.version, 0);
    assert.equal(tx.feePayer.address, signer.address);
    assert.equal(isKeyPairSigner(tx.feePayer), true);
    assert.equal(tx.instructions.length, 0);
    assert.equal(Object.hasOwn(tx, "lifetimeConstraint"), false);
    assert.equal(hasSetComputeUnitPriceInstruction(tx), false);
    assert.equal(hasSetComputeLimitInstruction(tx), false);
  });

  test("create a legacy transaction with an `Address` as the feePayer", () => {
    const tx = createTransaction({
      version: "legacy",
      feePayer: signer.address,
      instructions: [],
    });

    assert.equal(tx.version, "legacy");
    assert.equal(tx.feePayer.address, signer.address);
    assert.equal(isKeyPairSigner(tx.feePayer), false);
    assert.equal(tx.instructions.length, 0);
    assert.equal(Object.hasOwn(tx, "lifetimeConstraint"), false);
    assert.equal(hasSetComputeUnitPriceInstruction(tx), false);
    assert.equal(hasSetComputeLimitInstruction(tx), false);
  });

  test("create a legacy transaction with a compute unit limit instruction", () => {
    const tx = createTransaction({
      version: "legacy",
      feePayer: signer.address,
      instructions: [],
      computeUnitLimit: 0,
    });

    assert.equal(tx.version, "legacy");
    assert.equal(tx.instructions.length, 1);
    assert.equal(hasSetComputeLimitInstruction(tx), true);
    assert.equal(hasSetComputeUnitPriceInstruction(tx), false);
  });

  test("create a legacy transaction with a compute unit price instruction", () => {
    const tx = createTransaction({
      version: "legacy",
      feePayer: signer.address,
      instructions: [],
      computeUnitPrice: 0,
    });

    assert.equal(tx.version, "legacy");
    assert.equal(tx.instructions.length, 1);
    assert.equal(hasSetComputeLimitInstruction(tx), false);
    assert.equal(hasSetComputeUnitPriceInstruction(tx), true);
  });

  test("create a legacy transaction with both compute budget instructions", () => {
    const tx = createTransaction({
      version: "legacy",
      feePayer: signer.address,
      instructions: [],
      computeUnitLimit: 0,
      computeUnitPrice: 0,
    });

    assert.equal(tx.version, "legacy");
    assert.equal(tx.instructions.length, 2);
    assert.equal(hasSetComputeLimitInstruction(tx), true);
    assert.equal(hasSetComputeUnitPriceInstruction(tx), true);
  });

  test("create a version 0 transaction with an `Address` as the feePayer", () => {
    const tx = createTransaction({
      version: 0,
      feePayer: signer.address,
      instructions: [],
      latestBlockhash: {
        blockhash: blockhash("GK1nopeF3P8J46dGqq4KfaEWopZU7K65F6CKQXuUdr3z"),
        lastValidBlockHeight: 0n,
      },
    });

    assert.equal(tx.version, 0);
    assert.equal(tx.feePayer.address, signer.address);
    assert.equal(isKeyPairSigner(tx.feePayer), false);
    assert.equal(tx.instructions.length, 0);
    assert.equal(Object.hasOwn(tx, "lifetimeConstraint"), true);
    assert.equal(tx.lifetimeConstraint.blockhash, "GK1nopeF3P8J46dGqq4KfaEWopZU7K65F6CKQXuUdr3z");
    assert.equal(hasSetComputeUnitPriceInstruction(tx), false);
    assert.equal(hasSetComputeLimitInstruction(tx), false);
  });

  test("create a version 0 transaction with a compute unit limit instruction", () => {
    const tx = createTransaction({
      version: 0,
      feePayer: signer.address,
      instructions: [],
      computeUnitLimit: 0,
    });

    assert.equal(tx.version, 0);
    assert.equal(tx.instructions.length, 1);
    assert.equal(hasSetComputeLimitInstruction(tx), true);
    assert.equal(hasSetComputeUnitPriceInstruction(tx), false);
  });

  test("create a version 0 transaction with a compute unit price instruction", () => {
    const tx = createTransaction({
      version: 0,
      feePayer: signer.address,
      instructions: [],
      computeUnitPrice: 0,
    });

    assert.equal(tx.version, 0);
    assert.equal(tx.instructions.length, 1);
    assert.equal(hasSetComputeLimitInstruction(tx), false);
    assert.equal(hasSetComputeUnitPriceInstruction(tx), true);
  });

  test("create a version 0 transaction with both compute budget instructions", () => {
    const tx = createTransaction({
      version: 0,
      feePayer: signer.address,
      instructions: [],
      computeUnitLimit: 0,
      computeUnitPrice: 0,
    });

    assert.equal(tx.version, 0);
    assert.equal(tx.instructions.length, 2);
    assert.equal(hasSetComputeLimitInstruction(tx), true);
    assert.equal(hasSetComputeUnitPriceInstruction(tx), true);
  });
});
