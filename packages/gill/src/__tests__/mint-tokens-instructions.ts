import {
  getCreateAssociatedTokenIdempotentInstruction,
  getMintToInstruction,
  TOKEN_2022_PROGRAM_ADDRESS,
} from "@solana-program/token-2022";
import { getMintTokensInstructions, GetMintTokensInstructionsArgs } from "../programs";
import type { KeyPairSigner } from "@solana/signers";
import type { Address } from "@solana/addresses";
import { TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";

// Mock the imported functions
jest.mock("@solana-program/token-2022", () => ({
  // preserve all real implementations to only change the desired ones
  ...jest.requireActual("@solana-program/token-2022"),

  getCreateAssociatedTokenIdempotentInstruction: jest.fn(),
  getMintToInstruction: jest.fn(),
}));

describe("getMintTokensInstructions", () => {
  const mockPayer = { address: "payer" } as KeyPairSigner;
  const mockMint = { address: "mint" } as KeyPairSigner;
  const mockMintAuthority = { address: "mintAuthority" } as KeyPairSigner;
  const mockOwner = { address: "owner" } as KeyPairSigner;

  const mockAta = "mockAtaAddress" as Address;
  const mockAmount = BigInt(1000);

  beforeEach(() => {
    (getCreateAssociatedTokenIdempotentInstruction as jest.Mock).mockReturnValue({
      instruction: "mockCreateAtaInstruction",
    });

    (getMintToInstruction as jest.Mock).mockReturnValue({
      instruction: "mockMintToInstruction",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create instructions with default token program", () => {
    const args: GetMintTokensInstructionsArgs = {
      payer: mockPayer,
      mint: mockMint.address,
      mintAuthority: mockMintAuthority,
      owner: mockOwner.address,
      ata: mockAta,
      amount: mockAmount,
    };

    const instructions = getMintTokensInstructions(args);

    expect(instructions).toHaveLength(2);

    expect(getCreateAssociatedTokenIdempotentInstruction).toHaveBeenCalledWith({
      owner: mockOwner.address,
      mint: mockMint.address,
      ata: mockAta,
      payer: mockPayer,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });

    expect(getMintToInstruction).toHaveBeenCalledWith(
      {
        mint: mockMint.address,
        mintAuthority: mockMintAuthority,
        token: mockAta,
        amount: mockAmount,
      },
      {
        programAddress: TOKEN_PROGRAM_ADDRESS,
      },
    );
  });

  it("should create instructions with Token-2022 program", () => {
    const args: GetMintTokensInstructionsArgs = {
      payer: mockPayer,
      mint: mockMint.address,
      mintAuthority: mockMintAuthority,
      owner: mockOwner.address,
      ata: mockAta,
      amount: mockAmount,
      tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
    };

    const instructions = getMintTokensInstructions(args);

    expect(instructions).toHaveLength(2);
    expect(getCreateAssociatedTokenIdempotentInstruction).toHaveBeenCalledWith({
      owner: mockOwner.address,
      mint: mockMint.address,
      ata: mockAta,
      payer: mockPayer,
      tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
    });
  });

  it("should accept Address type for mint, mintAuthority, and owner", () => {
    const args: GetMintTokensInstructionsArgs = {
      payer: mockPayer,
      mint: "mintAddress" as Address,
      mintAuthority: "mintAuthorityAddress" as Address,
      owner: "ownerAddress" as Address,
      ata: mockAta,
      amount: mockAmount,
    };

    const instructions = getMintTokensInstructions(args);

    expect(instructions).toHaveLength(2);

    expect(getCreateAssociatedTokenIdempotentInstruction).toHaveBeenCalledWith({
      owner: args.owner,
      mint: args.mint,
      ata: mockAta,
      payer: mockPayer,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });

    expect(getMintToInstruction).toHaveBeenCalledWith(
      {
        mint: "mintAddress",
        mintAuthority: "mintAuthorityAddress",
        token: mockAta,
        amount: mockAmount,
      },
      {
        programAddress: TOKEN_PROGRAM_ADDRESS,
      },
    );
  });

  it("should accept number type for amount", () => {
    const args: GetMintTokensInstructionsArgs = {
      payer: mockPayer,
      mint: mockMint.address,
      mintAuthority: mockMintAuthority,
      owner: mockOwner.address,
      ata: mockAta,
      amount: 1000,
    };

    const instructions = getMintTokensInstructions(args);

    expect(instructions).toHaveLength(2);
    expect(getMintToInstruction).toHaveBeenCalledWith(
      {
        mint: mockMint.address,
        mintAuthority: mockMintAuthority,
        token: mockAta,
        amount: 1000,
      },
      {
        programAddress: TOKEN_PROGRAM_ADDRESS,
      },
    );
  });

  it("should throw error for unsupported token program", () => {
    const args: GetMintTokensInstructionsArgs = {
      payer: mockPayer,
      mint: mockMint.address,
      mintAuthority: mockMintAuthority,
      owner: mockOwner.address,
      ata: mockAta,
      amount: mockAmount,
      tokenProgram: "UnsupportedProgramId" as Address,
    };

    expect(() => getMintTokensInstructions(args)).toThrow();
  });
});
