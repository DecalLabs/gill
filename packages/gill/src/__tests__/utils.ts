import { GENESIS_HASH, getMonikerFromGenesisHash, lamportsToSol } from "../core";

describe("getMonikerFromGenesisHash", () => {
  it("should return 'mainnet' for mainnet genesis hash", () => {
    const result = getMonikerFromGenesisHash(GENESIS_HASH.mainnet);
    expect(result).toBe("mainnet");
  });

  it("should return 'devnet' for devnet genesis hash", () => {
    const result = getMonikerFromGenesisHash(GENESIS_HASH.devnet);
    expect(result).toBe("devnet");
  });

  it("should return 'testnet' for testnet genesis hash", () => {
    const result = getMonikerFromGenesisHash(GENESIS_HASH.testnet);
    expect(result).toBe("testnet");
  });

  it("should return 'unknown' for unrecognized hash", () => {
    const result = getMonikerFromGenesisHash("unknown-hash-value");
    expect(result).toBe("unknown");
  });
});

describe("lamportsToSol", () => {
  it("should convert correctly to 1 SOL", () => {
    const result = lamportsToSol(1_000_000_000);
    expect(result).toBe("1");
  });

  it("should convert correctly to 0.5 SOL", () => {
    const result = lamportsToSol(500_000_000);
    expect(result).toBe("0.5");
  });

  it("should convert correctly to 0.000000001 SOL", () => {
    const result = lamportsToSol(1);
    expect(result).toBe("0.000000001");
  });

  it("should convert correctly to 0 SOL", () => {
    const result = lamportsToSol(0);
    expect(result).toBe("0");
  });

  it("should convert a BigInt correctly", () => {
    // Max safe number value is 9_007_199_254_740_991
    const result = lamportsToSol(10_000_000_333_333_333n);
    expect(result).toBe("10,000,000.333333332");
  });

  it("should format with custom decimal places", () => {
    const lamports = 1_234_567_890;
    expect(lamportsToSol(lamports, 0)).toBe("1");
    expect(lamportsToSol(lamports, 1)).toBe("1.2");
    expect(lamportsToSol(lamports, 2)).toBe("1.23");
    expect(lamportsToSol(lamports, 3)).toBe("1.235");
    expect(lamportsToSol(lamports, 4)).toBe("1.2346");
    expect(lamportsToSol(lamports, 5)).toBe("1.23457");
    expect(lamportsToSol(lamports, 6)).toBe("1.234568");
    expect(lamportsToSol(lamports, 7)).toBe("1.2345679");
    expect(lamportsToSol(lamports, 8)).toBe("1.23456789");
    expect(lamportsToSol(lamports, 9)).toBe("1.23456789");
  });

  it("should handle decimals parameter greater than 9", () => {
    const lamports = 1_234_567_890;
    expect(lamportsToSol(lamports, 10)).toBe("1.23456789");
    expect(lamportsToSol(lamports, 15)).toBe("1.23456789");
  });

  it("should remove trailing zeros with custom decimals", () => {
    const lamports = 1_500_000_000;
    expect(lamportsToSol(lamports, 2)).toBe("1.5");
    expect(lamportsToSol(lamports, 3)).toBe("1.5");
    expect(lamportsToSol(lamports, 9)).toBe("1.5");
  });

  it("should handle very small amounts with custom decimals", () => {
    const lamports = 123;
    expect(lamportsToSol(lamports, 0)).toBe("0");
    expect(lamportsToSol(lamports, 3)).toBe("0");
    expect(lamportsToSol(lamports, 6)).toBe("0");
    expect(lamportsToSol(lamports, 7)).toBe("0.0000001");
    expect(lamportsToSol(lamports, 8)).toBe("0.00000012");
    expect(lamportsToSol(lamports, 9)).toBe("0.000000123");
  });
});
