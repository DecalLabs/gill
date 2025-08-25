import {
  address,
  createTransactionMessage,
  pipe,
  setTransactionMessageFeePayerSigner,
  appendTransactionMessageInstruction,
  createNoopSigner,
  type Blockhash,
  type MicroLamports,
  type Rpc,
} from "@solana/kit";
import {
  getTransferSolInstruction,
  COMPUTE_BUDGET_PROGRAM_ADDRESS,
  updateOrAppendSetComputeUnitLimitInstruction,
  updateOrAppendSetComputeUnitPriceInstruction,
  getSetComputeUnitLimitInstruction,
  getSetComputeUnitPriceInstruction,
  MAX_COMPUTE_UNIT_LIMIT,
} from "../programs";
import { prepareTransaction } from "../core/prepare-transaction";

describe("prepareTransaction", () => {
  const mockFeePayer = createNoopSigner(address("AMi1Z111111111111111111111111111111111111111"));
  const mockDestination = address("Gi11222222222222222222222222222222222222222");

  it("should add compute unit limit when none exists", async () => {
    // Create a transaction without compute budget instructions
    const transaction = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(mockFeePayer, tx),
      (tx) =>
        appendTransactionMessageInstruction(
          getTransferSolInstruction({
            source: mockFeePayer,
            destination: mockDestination,
            amount: 1_000_000n,
          }),
          tx,
        ),
    );

    // Mock the RPC calls with proper estimateComputeUnitLimitFactory response
    const mockRpc = {
      getLatestBlockhash: () => ({
        send: async () => ({
          value: {
            blockhash: "GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi" as Blockhash,
            lastValidBlockHeight: 100n,
          },
        }),
      }),
      simulateTransaction: () => ({
        send: async () => ({
          value: {
            err: null,
            unitsConsumed: 5000n,
            logs: [],
          },
        }),
      }),
    } as Rpc<any>;

    const prepared = await prepareTransaction({
      transaction,
      rpc: mockRpc,
      computeUnitLimitMultiplier: 1.2,
    });

    // Check that compute unit limit instruction was added using introspection
    const computeLimitInstructions = prepared.instructions.filter(
      (ix) => String(ix.programAddress) === String(COMPUTE_BUDGET_PROGRAM_ADDRESS),
    );

    expect(computeLimitInstructions).toHaveLength(1);

    // Verify it's the expected instruction with the expected value
    const expectedInstruction = getSetComputeUnitLimitInstruction({
      units: 6000, // 5000 * 1.2
    });

    expect(computeLimitInstructions[0]).toEqual(expectedInstruction);

    // Check that blockhash was set
    expect(prepared.lifetimeConstraint.blockhash).toBe("GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi");
  });

  it("should add priority fee when provided", async () => {
    const transaction = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(mockFeePayer, tx),
      (tx) =>
        appendTransactionMessageInstruction(
          getTransferSolInstruction({
            source: mockFeePayer,
            destination: mockDestination,
            amount: 1_000_000n,
          }),
          tx,
        ),
    );

    const mockRpc = {
      getLatestBlockhash: () => ({
        send: async () => ({
          value: {
            blockhash: "GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi" as Blockhash,
            lastValidBlockHeight: 100n,
          },
        }),
      }),
      simulateTransaction: () => ({
        send: async () => ({
          value: {
            err: null,
            unitsConsumed: 5000n,
            logs: [],
          },
        }),
      }),
    } as Rpc<any>;

    const prepared = await prepareTransaction({
      transaction,
      rpc: mockRpc,
      computeUnitPrice: 5000n, // 5000 microlamports
    });

    // Should have both compute unit limit and price instructions
    const computeBudgetInstructions = prepared.instructions.filter(
      (ix) => String(ix.programAddress) === String(COMPUTE_BUDGET_PROGRAM_ADDRESS),
    );
    expect(computeBudgetInstructions).toHaveLength(2);

    // Verify the instructions are what we expect
    const expectedLimitInstruction = getSetComputeUnitLimitInstruction({
      units: 5500, // 5000 * 1.1 (default multiplier)
    });
    const expectedPriceInstruction = getSetComputeUnitPriceInstruction({
      microLamports: 5000n as MicroLamports,
    });

    // Check both instructions are present (order may vary)
    expect(computeBudgetInstructions).toContainEqual(expectedLimitInstruction);
    expect(computeBudgetInstructions).toContainEqual(expectedPriceInstruction);
  });

  it("should throw when simulation fails", async () => {
    const transaction = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(mockFeePayer, tx),
      (tx) =>
        appendTransactionMessageInstruction(
          getTransferSolInstruction({
            source: mockFeePayer,
            destination: mockDestination,
            amount: 1_000_000n,
          }),
          tx,
        ),
    );

    // Mock RPC that will cause the estimateComputeUnitLimitFactory to throw
    const mockRpc = {
      getLatestBlockhash: () => ({
        send: async () => ({
          value: {
            blockhash: "GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi" as Blockhash,
            lastValidBlockHeight: 100n,
          },
        }),
      }),
      simulateTransaction: () => ({
        send: async () => {
          throw new Error("RPC simulation failed");
        },
      }),
    } as Rpc<any>;

    await expect(
      prepareTransaction({
        transaction,
        rpc: mockRpc,
      }),
    ).rejects.toThrow();
  });

  // Compute unit edge cases
  it("should cap compute units at MAX_COMPUTE_UNIT_LIMIT when estimation exceeds it", async () => {
    const transaction = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(mockFeePayer, tx),
      (tx) =>
        appendTransactionMessageInstruction(
          getTransferSolInstruction({
            source: mockFeePayer,
            destination: mockDestination,
            amount: 1_000_000n,
          }),
          tx,
        ),
    );

    const mockRpc = {
      getLatestBlockhash: () => ({
        send: async () => ({
          value: {
            blockhash: "GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi" as Blockhash,
            lastValidBlockHeight: 100n,
          },
        }),
      }),
      simulateTransaction: () => ({
        send: async () => ({
          value: {
            err: null,
            unitsConsumed: 1_300_000n, // Very high consumption that will exceed max when multiplied
            logs: [],
          },
        }),
      }),
    } as Rpc<any>;

    const prepared = await prepareTransaction({
      transaction,
      rpc: mockRpc,
      computeUnitLimitMultiplier: 1.5, // This would result in 1.95M, which exceeds the max
    });

    // Find the compute unit limit instruction
    const computeBudgetInstructions = prepared.instructions.filter(
      (ix) => String(ix.programAddress) === String(COMPUTE_BUDGET_PROGRAM_ADDRESS),
    );

    expect(computeBudgetInstructions).toHaveLength(1);

    const expectedInstruction = getSetComputeUnitLimitInstruction({
      units: MAX_COMPUTE_UNIT_LIMIT,
    });

    expect(computeBudgetInstructions[0]).toEqual(expectedInstruction);
  });

  // Priority fee scenarios
  it("should accept computeUnitPrice as number", async () => {
    const transaction = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(mockFeePayer, tx),
      (tx) =>
        appendTransactionMessageInstruction(
          getTransferSolInstruction({
            source: mockFeePayer,
            destination: mockDestination,
            amount: 1_000_000n,
          }),
          tx,
        ),
    );

    const mockRpc = {
      getLatestBlockhash: () => ({
        send: async () => ({
          value: {
            blockhash: "GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi" as Blockhash,
            lastValidBlockHeight: 100n,
          },
        }),
      }),
      simulateTransaction: () => ({
        send: async () => ({
          value: {
            err: null,
            unitsConsumed: 5000n,
            logs: [],
          },
        }),
      }),
    } as Rpc<any>;

    const prepared = await prepareTransaction({
      transaction,
      rpc: mockRpc,
      computeUnitPrice: 1000, // number
    });

    // Should have both compute limit and price instructions
    const computeBudgetInstructions = prepared.instructions.filter(
      (ix) => String(ix.programAddress) === String(COMPUTE_BUDGET_PROGRAM_ADDRESS),
    );
    expect(computeBudgetInstructions).toHaveLength(2);

    const expectedLimitInstruction = getSetComputeUnitLimitInstruction({
      units: 5500,
    });
    const expectedPriceInstruction = getSetComputeUnitPriceInstruction({
      microLamports: 1000n as MicroLamports,
    });

    expect(computeBudgetInstructions).toContainEqual(expectedLimitInstruction);
    expect(computeBudgetInstructions).toContainEqual(expectedPriceInstruction);
  });
  it("should accept computeUnitPrice as bigint", async () => {
    const transaction = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(mockFeePayer, tx),
      (tx) =>
        appendTransactionMessageInstruction(
          getTransferSolInstruction({
            source: mockFeePayer,
            destination: mockDestination,
            amount: 1_000_000n,
          }),
          tx,
        ),
    );

    const mockRpc = {
      getLatestBlockhash: () => ({
        send: async () => ({
          value: {
            blockhash: "GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi" as Blockhash,
            lastValidBlockHeight: 100n,
          },
        }),
      }),
      simulateTransaction: () => ({
        send: async () => ({
          value: {
            err: null,
            unitsConsumed: 5000n,
            logs: [],
          },
        }),
      }),
    } as Rpc<any>;

    const prepared = await prepareTransaction({
      transaction,
      rpc: mockRpc,
      computeUnitPrice: 2000n, // bigint
    });

    // Should have both compute limit and price instructions
    const computeBudgetInstructions = prepared.instructions.filter(
      (ix) => String(ix.programAddress) === String(COMPUTE_BUDGET_PROGRAM_ADDRESS),
    );
    expect(computeBudgetInstructions).toHaveLength(2);

    const expectedLimitInstruction = getSetComputeUnitLimitInstruction({
      units: 5500,
    });
    const expectedPriceInstruction = getSetComputeUnitPriceInstruction({
      microLamports: 2000n as MicroLamports,
    });

    expect(computeBudgetInstructions).toContainEqual(expectedLimitInstruction);
    expect(computeBudgetInstructions).toContainEqual(expectedPriceInstruction);
  });
  it("should accept computeUnitPrice as MicroLamports", async () => {
    const transaction = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(mockFeePayer, tx),
      (tx) =>
        appendTransactionMessageInstruction(
          getTransferSolInstruction({
            source: mockFeePayer,
            destination: mockDestination,
            amount: 1_000_000n,
          }),
          tx,
        ),
    );

    const mockRpc = {
      getLatestBlockhash: () => ({
        send: async () => ({
          value: {
            blockhash: "GHtXQBsoZHVnNFa9YevAzFr17DJjgHXk3ycTKD5xD3Zi" as Blockhash,
            lastValidBlockHeight: 100n,
          },
        }),
      }),
      simulateTransaction: () => ({
        send: async () => ({
          value: {
            err: null,
            unitsConsumed: 5000n,
            logs: [],
          },
        }),
      }),
    } as Rpc<any>;

    const prepared = await prepareTransaction({
      transaction,
      rpc: mockRpc,
      computeUnitPrice: 3000n as MicroLamports,
    });

    // Should have both compute limit and price instructions
    const computeBudgetInstructions = prepared.instructions.filter(
      (ix) => String(ix.programAddress) === String(COMPUTE_BUDGET_PROGRAM_ADDRESS),
    );
    expect(computeBudgetInstructions).toHaveLength(2);

    const expectedLimitInstruction = getSetComputeUnitLimitInstruction({
      units: 5500,
    });
    const expectedPriceInstruction = getSetComputeUnitPriceInstruction({
      microLamports: 3000n as MicroLamports,
    });

    expect(computeBudgetInstructions).toContainEqual(expectedLimitInstruction);
    expect(computeBudgetInstructions).toContainEqual(expectedPriceInstruction);
  });

  // Blockhash scenarios
  it("should preserve existing blockhash when blockhashReset is false", async () => {
    const existingBlockhash = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
    const existingLastValidBlockHeight = 50n;

    const transaction = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(mockFeePayer, tx),
      (tx) => ({
        ...tx,
        lifetimeConstraint: {
          blockhash: existingBlockhash as Blockhash,
          lastValidBlockHeight: existingLastValidBlockHeight,
        },
      }),
      (tx) =>
        appendTransactionMessageInstruction(
          getTransferSolInstruction({
            source: mockFeePayer,
            destination: mockDestination,
            amount: 1_000_000n,
          }),
          tx,
        ),
    );

    const mockRpc = {
      getLatestBlockhash: () => ({
        send: async () => ({
          value: {
            blockhash: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d" as Blockhash,
            lastValidBlockHeight: 100n,
          },
        }),
      }),
      simulateTransaction: () => ({
        send: async () => ({
          value: {
            err: null,
            unitsConsumed: 5000n,
            logs: [],
          },
        }),
      }),
    } as Rpc<any>;

    const prepared = await prepareTransaction({
      transaction,
      rpc: mockRpc,
      blockhashReset: false,
    });

    // Should preserve the original blockhash
    expect(prepared.lifetimeConstraint.blockhash).toBe(existingBlockhash);
    expect(prepared.lifetimeConstraint.lastValidBlockHeight).toBe(existingLastValidBlockHeight);
  });
  it("should update existing blockhash when blockhashReset is true", async () => {
    const existingBlockhash = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
    const existingLastValidBlockHeight = 50n;
    const newBlockhash = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d";
    const newLastValidBlockHeight = 100n;

    const transaction = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(mockFeePayer, tx),
      (tx) => ({
        ...tx,
        lifetimeConstraint: {
          blockhash: existingBlockhash as Blockhash,
          lastValidBlockHeight: existingLastValidBlockHeight,
        },
      }),
      (tx) =>
        appendTransactionMessageInstruction(
          getTransferSolInstruction({
            source: mockFeePayer,
            destination: mockDestination,
            amount: 1_000_000n,
          }),
          tx,
        ),
    );

    const mockRpc = {
      getLatestBlockhash: () => ({
        send: async () => ({
          value: {
            blockhash: newBlockhash as Blockhash,
            lastValidBlockHeight: newLastValidBlockHeight,
          },
        }),
      }),
      simulateTransaction: () => ({
        send: async () => ({
          value: {
            err: null,
            unitsConsumed: 5000n,
            logs: [],
          },
        }),
      }),
    } as Rpc<any>;

    const prepared = await prepareTransaction({
      transaction,
      rpc: mockRpc,
      blockhashReset: true,
    });

    // Should use the new blockhash
    expect(prepared.lifetimeConstraint.blockhash).toBe(newBlockhash);
    expect(prepared.lifetimeConstraint.lastValidBlockHeight).toBe(newLastValidBlockHeight);
  });
  it("should add blockhash when transaction has none and blockhashReset is false", async () => {
    // Create transaction without blockhash
    const transaction = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(mockFeePayer, tx),
      (tx) =>
        appendTransactionMessageInstruction(
          getTransferSolInstruction({
            source: mockFeePayer,
            destination: mockDestination,
            amount: 1_000_000n,
          }),
          tx,
        ),
    );

    const newBlockhash = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d";
    const newLastValidBlockHeight = 100n;

    const mockRpc = {
      getLatestBlockhash: () => ({
        send: async () => ({
          value: {
            blockhash: newBlockhash as Blockhash,
            lastValidBlockHeight: newLastValidBlockHeight,
          },
        }),
      }),
      simulateTransaction: () => ({
        send: async () => ({
          value: {
            err: null,
            unitsConsumed: 5000n,
            logs: [],
          },
        }),
      }),
    } as Rpc<any>;

    const prepared = await prepareTransaction({
      transaction,
      rpc: mockRpc,
      blockhashReset: false, // Even with false, it should add blockhash if none exists
      computeUnitLimitReset: false, // Disable estimation to avoid simulation errors
    });

    // Should add the blockhash even when blockhashReset is false
    expect(prepared.lifetimeConstraint.blockhash).toBe(newBlockhash);
    expect(prepared.lifetimeConstraint.lastValidBlockHeight).toBe(newLastValidBlockHeight);
  });

  // Configuration combinations
  it("should handle computeUnitLimitReset=true and blockhashReset=false", async () => {
    const existingBlockhash = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
    const existingLastValidBlockHeight = 50n;

    const transaction = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(mockFeePayer, tx),
      (tx) => ({
        ...tx,
        lifetimeConstraint: {
          blockhash: existingBlockhash as Blockhash,
          lastValidBlockHeight: existingLastValidBlockHeight,
        },
      }),
      (tx) =>
        appendTransactionMessageInstruction(
          getTransferSolInstruction({
            source: mockFeePayer,
            destination: mockDestination,
            amount: 1_000_000n,
          }),
          tx,
        ),
    );

    const mockRpc = {
      getLatestBlockhash: () => ({
        send: async () => ({
          value: {
            blockhash: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d" as Blockhash,
            lastValidBlockHeight: 100n,
          },
        }),
      }),
      simulateTransaction: () => ({
        send: async () => ({
          value: {
            err: null,
            unitsConsumed: 5000n,
            logs: [],
          },
        }),
      }),
    } as Rpc<any>;

    const prepared = await prepareTransaction({
      transaction,
      rpc: mockRpc,
      computeUnitLimitReset: true, // Should estimate compute units
      blockhashReset: false, // Should preserve existing blockhash
    });

    // Should preserve the original blockhash
    expect(prepared.lifetimeConstraint.blockhash).toBe(existingBlockhash);
    expect(prepared.lifetimeConstraint.lastValidBlockHeight).toBe(existingLastValidBlockHeight);

    // Should have compute unit limit instruction added
    const computeBudgetInstructions = prepared.instructions.filter(
      (ix) => String(ix.programAddress) === String(COMPUTE_BUDGET_PROGRAM_ADDRESS),
    );
    expect(computeBudgetInstructions).toHaveLength(1);

    const expectedInstruction = getSetComputeUnitLimitInstruction({
      units: 5500,
    });
    expect(computeBudgetInstructions[0]).toEqual(expectedInstruction);
  });
  it("should handle computeUnitLimitReset=false and blockhashReset=true", async () => {
    const existingBlockhash = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
    const existingLastValidBlockHeight = 50n;
    const newBlockhash = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d";
    const newLastValidBlockHeight = 100n;

    const transaction = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(mockFeePayer, tx),
      (tx) => ({
        ...tx,
        lifetimeConstraint: {
          blockhash: existingBlockhash as Blockhash,
          lastValidBlockHeight: existingLastValidBlockHeight,
        },
      }),
      (tx) => updateOrAppendSetComputeUnitLimitInstruction(100_000, tx), // Pre-add compute limit
      (tx) =>
        appendTransactionMessageInstruction(
          getTransferSolInstruction({
            source: mockFeePayer,
            destination: mockDestination,
            amount: 1_000_000n,
          }),
          tx,
        ),
    );

    const mockRpc = {
      getLatestBlockhash: () => ({
        send: async () => ({
          value: {
            blockhash: newBlockhash as Blockhash,
            lastValidBlockHeight: newLastValidBlockHeight,
          },
        }),
      }),
      simulateTransaction: () => ({
        send: async () => ({
          value: {
            err: null,
            unitsConsumed: 5000n,
            logs: [],
          },
        }),
      }),
    } as Rpc<any>;

    const prepared = await prepareTransaction({
      transaction,
      rpc: mockRpc,
      computeUnitLimitReset: false, // Should not estimate compute units
      blockhashReset: true, // Should update blockhash
    });

    // Should use the new blockhash
    expect(prepared.lifetimeConstraint.blockhash).toBe(newBlockhash);
    expect(prepared.lifetimeConstraint.lastValidBlockHeight).toBe(newLastValidBlockHeight);

    // Should have kept the existing compute unit limit instruction (no re-estimation)
    const computeBudgetInstructions = prepared.instructions.filter(
      (ix) => String(ix.programAddress) === String(COMPUTE_BUDGET_PROGRAM_ADDRESS),
    );
    expect(computeBudgetInstructions).toHaveLength(1);

    const expectedInstruction = getSetComputeUnitLimitInstruction({
      units: 100_000,
    });
    expect(computeBudgetInstructions[0]).toEqual(expectedInstruction);
  });
  it("should handle both computeUnitLimitReset=false and blockhashReset=false", async () => {
    const existingBlockhash = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";
    const existingLastValidBlockHeight = 50n;
    const transaction = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(mockFeePayer, tx),
      (tx) => ({
        ...tx,
        lifetimeConstraint: {
          blockhash: existingBlockhash as Blockhash,
          lastValidBlockHeight: existingLastValidBlockHeight,
        },
      }),
      (tx) => updateOrAppendSetComputeUnitLimitInstruction(100_000, tx), // Pre-add compute limit
      (tx) =>
        appendTransactionMessageInstruction(
          getTransferSolInstruction({
            source: mockFeePayer,
            destination: mockDestination,
            amount: 1_000_000n,
          }),
          tx,
        ),
    );

    const mockRpc = {
      getLatestBlockhash: () => ({
        send: async () => ({
          value: {
            blockhash: "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d" as Blockhash,
            lastValidBlockHeight: 100n,
          },
        }),
      }),
      simulateTransaction: () => ({
        send: async () => ({
          value: {
            err: null,
            unitsConsumed: 5000n,
            logs: [],
          },
        }),
      }),
    } as Rpc<any>;

    const prepared = await prepareTransaction({
      transaction,
      rpc: mockRpc,
      computeUnitLimitReset: false, // Should not estimate compute units
      blockhashReset: false, // Should preserve existing blockhash
    });

    // Should preserve the original blockhash
    expect(prepared.lifetimeConstraint.blockhash).toBe(existingBlockhash);
    expect(prepared.lifetimeConstraint.lastValidBlockHeight).toBe(existingLastValidBlockHeight);

    // Should have kept the existing compute unit limit instruction unchanged
    const computeBudgetInstructions = prepared.instructions.filter(
      (ix) => String(ix.programAddress) === String(COMPUTE_BUDGET_PROGRAM_ADDRESS),
    );
    expect(computeBudgetInstructions).toHaveLength(1);

    const expectedInstruction = getSetComputeUnitLimitInstruction({
      units: 100_000,
    });
    expect(computeBudgetInstructions[0]).toEqual(expectedInstruction);
  });

  // Complex scenarios
  it("should handle transactions that already have both compute limit and price instructions", async () => {
    const transaction = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(mockFeePayer, tx),
      (tx) => updateOrAppendSetComputeUnitLimitInstruction(80_000, tx), // Pre-add compute limit
      (tx) => updateOrAppendSetComputeUnitPriceInstruction(1000n as MicroLamports, tx), // Pre-add priority fee
      (tx) =>
        appendTransactionMessageInstruction(
          getTransferSolInstruction({
            source: mockFeePayer,
            destination: mockDestination,
            amount: 1_000_000n,
          }),
          tx,
        ),
    );

    const mockRpc = {
      getLatestBlockhash: () => ({
        send: async () => ({
          value: {
            blockhash: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM" as Blockhash,
            lastValidBlockHeight: 100n,
          },
        }),
      }),
      simulateTransaction: () => ({
        send: async () => ({
          value: {
            err: null,
            unitsConsumed: 5000n,
            logs: [],
          },
        }),
      }),
    } as Rpc<any>;

    const prepared = await prepareTransaction({
      transaction,
      rpc: mockRpc,
      computeUnitLimitReset: true, // Should re-estimate despite existing limit
      computeUnitPrice: 2000n, // Should update the existing price
    });

    // Should still have both compute limit and price instructions
    const computeBudgetInstructions = prepared.instructions.filter(
      (ix) => String(ix.programAddress) === String(COMPUTE_BUDGET_PROGRAM_ADDRESS),
    );
    expect(computeBudgetInstructions).toHaveLength(2);

    const expectedLimitInstruction = getSetComputeUnitLimitInstruction({
      units: 5500,
    });
    const expectedPriceInstruction = getSetComputeUnitPriceInstruction({
      microLamports: 2000n as MicroLamports,
    });

    expect(computeBudgetInstructions).toContainEqual(expectedLimitInstruction);
    expect(computeBudgetInstructions).toContainEqual(expectedPriceInstruction);
  });

  // Default values
  it("should use default computeUnitLimitMultiplier of 1.1 when not specified", async () => {
    const transaction = pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(mockFeePayer, tx),
      (tx) =>
        appendTransactionMessageInstruction(
          getTransferSolInstruction({
            source: mockFeePayer,
            destination: mockDestination,
            amount: 1_000_000n,
          }),
          tx,
        ),
    );

    const mockRpc = {
      getLatestBlockhash: () => ({
        send: async () => ({
          value: {
            blockhash: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM" as Blockhash,
            lastValidBlockHeight: 100n,
          },
        }),
      }),
      simulateTransaction: () => ({
        send: async () => ({
          value: {
            err: null,
            unitsConsumed: 10000n, // 10k * 1.1 = 11k
            logs: [],
          },
        }),
      }),
    } as Rpc<any>;

    const prepared = await prepareTransaction({
      transaction,
      rpc: mockRpc,
      // No computeUnitLimitMultiplier specified - should default to 1.1
    });

    // Find the compute unit limit instruction and verify it used the 1.1 multiplier
    const computeBudgetInstructions = prepared.instructions.filter(
      (ix) => String(ix.programAddress) === String(COMPUTE_BUDGET_PROGRAM_ADDRESS),
    );

    expect(computeBudgetInstructions).toHaveLength(1);

    const expectedInstruction = getSetComputeUnitLimitInstruction({
      units: 11000,
    });

    expect(computeBudgetInstructions[0]).toEqual(expectedInstruction);
  });
});
