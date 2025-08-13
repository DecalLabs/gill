import { getCreateAccountInstruction } from "@solana-program/system";
import type { Address, Instruction, KeyPairSigner } from "@solana/kit";
import { generateKeyPairSigner } from "@solana/kit";
import { getMinimumBalanceForRentExemption } from "../core";
import { getCreateTokenInstructions, GetCreateTokenInstructionsArgs, TOKEN_PROGRAM_ADDRESS } from "../programs/token";
import { getCreateMetadataAccountV3Instruction } from "../programs/token-metadata";

import {
  getInitializeMetadataPointerInstruction,
  getInitializeMintInstruction,
  getInitializeTokenMetadataInstruction,
  getMintSize,
  TOKEN_2022_PROGRAM_ADDRESS,
} from "@solana-program/token-2022";

const MOCK_SPACE = 122n;
const MOCK_RENT = 10000n;

jest.mock("../core", () => ({
  // preserve all real implementations to only change the desired ones
  ...jest.requireActual("../core"),
  getMinimumBalanceForRentExemption: jest.fn(),
}));

jest.mock("../programs/token-metadata", () => ({
  // preserve all real implementations to only change the desired ones
  ...jest.requireActual("../programs/token-metadata"),
  getCreateMetadataAccountV3Instruction: jest.fn(),
}));

jest.mock("@solana-program/system", () => ({
  getCreateAccountInstruction: jest.fn(),
}));

jest.mock("@solana-program/token-2022", () => ({
  // preserve all real implementations to only change the desired ones
  ...jest.requireActual("@solana-program/token-2022"),
  getMintSize: jest.fn(),
  getInitializeMintInstruction: jest.fn(),
  getInitializeMetadataPointerInstruction: jest.fn(),
  getInitializeTokenMetadataInstruction: jest.fn(),
}));

describe("getCreateTokenInstructions", () => {
  let mockPayer: KeyPairSigner;
  let mockMint: KeyPairSigner;

  let mockMetadataAddress = "mockMetadataAddress" as Address;

  let mockMintAuthority: KeyPairSigner;
  let mockFreezeAuthority: KeyPairSigner;

  let mockCreateAccountInstruction: Instruction;
  let mockInitializeMintInstruction: Instruction;
  let mockCreateMetadataInstruction: Instruction;

  let mockInitializeMetadataPointerInstruction: Instruction;
  let mockInitializeTokenMetadataInstruction: Instruction;

  const metadata: GetCreateTokenInstructionsArgs["metadata"] = {
    name: "Test Token",
    symbol: "TEST",
    uri: "https://example.com/metadata.json",
    isMutable: true,
  };

  beforeAll(async () => {
    [mockPayer, mockMint, mockMintAuthority, mockFreezeAuthority] = await Promise.all([
      generateKeyPairSigner(),
      generateKeyPairSigner(),
      generateKeyPairSigner(),
      generateKeyPairSigner(),
    ]);
  });

  beforeEach(() => {
    mockCreateAccountInstruction = {
      programAddress: "system" as Address,
      data: new Uint8Array([1]),
    };
    mockInitializeMintInstruction = {
      programAddress: "tokenProgram" as Address,
      data: new Uint8Array([2]),
    };
    mockCreateMetadataInstruction = {
      programAddress: "metadata" as Address,
      data: new Uint8Array([4]),
    };
    mockInitializeTokenMetadataInstruction = {
      programAddress: "initMetadata" as Address,
      data: new Uint8Array([5]),
    };
    mockInitializeMetadataPointerInstruction = {
      programAddress: "initMetadataPointer" as Address,
      data: new Uint8Array([6]),
    };

    (getCreateAccountInstruction as jest.Mock).mockReturnValue(mockCreateAccountInstruction);
    (getInitializeMintInstruction as jest.Mock).mockReturnValue(mockInitializeMintInstruction);
    (getCreateMetadataAccountV3Instruction as jest.Mock).mockReturnValue(mockCreateMetadataInstruction);
    (getInitializeMetadataPointerInstruction as jest.Mock).mockReturnValue(mockInitializeMetadataPointerInstruction);
    (getInitializeTokenMetadataInstruction as jest.Mock).mockReturnValue(mockInitializeTokenMetadataInstruction);

    (getMinimumBalanceForRentExemption as jest.Mock).mockReturnValue(MOCK_RENT);
    (getMintSize as jest.Mock).mockReturnValue(MOCK_SPACE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create basic token instructions with default values", () => {
    const args: GetCreateTokenInstructionsArgs = {
      feePayer: mockPayer,
      mint: mockMint,
      metadataAddress: mockMetadataAddress,
      metadata,
    };

    const instructions = getCreateTokenInstructions(args);

    expect(instructions).toHaveLength(3);
    expect(instructions[0]).toBe(mockCreateAccountInstruction);
    expect(instructions[1]).toBe(mockInitializeMintInstruction);
    expect(instructions[2]).toBe(mockCreateMetadataInstruction);

    expect(getCreateAccountInstruction).toHaveBeenCalledWith({
      payer: mockPayer,
      newAccount: mockMint,
      lamports: MOCK_RENT,
      space: MOCK_SPACE,
      programAddress: TOKEN_PROGRAM_ADDRESS,
    });

    expect(getInitializeMintInstruction).toHaveBeenCalledWith(
      {
        mint: mockMint.address,
        decimals: 9,
        mintAuthority: mockPayer.address,
        freezeAuthority: null,
      },
      {
        programAddress: TOKEN_PROGRAM_ADDRESS,
      },
    );

    expect(getCreateMetadataAccountV3Instruction).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: mockMetadataAddress,
        mint: mockMint.address,
        mintAuthority: mockPayer,
        payer: mockPayer,
        updateAuthority: mockPayer,
        data: {
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
        isMutable: true,
        collectionDetails: null,
      }),
    );
  });

  it("should throw error for unsupported token program", () => {
    const args: GetCreateTokenInstructionsArgs = {
      feePayer: mockPayer,
      mint: mockMint,
      metadataAddress: mockMetadataAddress,
      metadata,
      tokenProgram: "UnsupportedProgramId" as Address,
    };

    expect(() => getCreateTokenInstructions(args)).toThrow(
      "Unsupported token program. Try 'TOKEN_PROGRAM_ADDRESS' or 'TOKEN_2022_PROGRAM_ADDRESS'",
    );
  });

  describe("should use original token program", () => {
    it("should use original token program when specified", () => {
      const args: GetCreateTokenInstructionsArgs = {
        feePayer: mockPayer,
        mint: mockMint,
        metadataAddress: mockMetadataAddress,
        tokenProgram: TOKEN_PROGRAM_ADDRESS,
        metadata,
      };

      getCreateTokenInstructions(args);

      expect(getCreateAccountInstruction).toHaveBeenCalledWith(
        expect.objectContaining({
          space: MOCK_SPACE,
          programAddress: TOKEN_PROGRAM_ADDRESS,
        }),
      );

      expect(getInitializeMintInstruction).toHaveBeenCalledWith(
        expect.objectContaining({
          mint: mockMint.address,
        }),
        {
          programAddress: TOKEN_PROGRAM_ADDRESS,
        },
      );
    });

    it("should use custom decimals when provided", () => {
      const args: GetCreateTokenInstructionsArgs = {
        feePayer: mockPayer,
        metadataAddress: mockMetadataAddress,
        mint: mockMint,
        decimals: 6,
        metadata,
      };

      getCreateTokenInstructions(args);

      expect(getInitializeMintInstruction).toHaveBeenCalledWith(
        expect.objectContaining({
          mint: mockMint.address,
          decimals: 6,
        }),
        {
          programAddress: TOKEN_PROGRAM_ADDRESS,
        },
      );
    });

    it("should allow custom decimals of 0 when provided, not the default of 9", () => {
      const args: GetCreateTokenInstructionsArgs = {
        feePayer: mockPayer,
        metadataAddress: mockMetadataAddress,
        mint: mockMint,
        decimals: 0,
        metadata,
      };

      getCreateTokenInstructions(args);

      expect(getInitializeMintInstruction).toHaveBeenCalledWith(
        expect.objectContaining({
          mint: mockMint.address,
          decimals: 0,
        }),
        {
          programAddress: TOKEN_PROGRAM_ADDRESS,
        },
      );
    });

    it("should use custom mint and freeze authorities when provided", () => {
      const args: GetCreateTokenInstructionsArgs = {
        feePayer: mockPayer,
        mint: mockMint,
        metadataAddress: mockMetadataAddress,
        metadata,
        mintAuthority: mockMintAuthority,
        freezeAuthority: mockFreezeAuthority.address,
      };

      getCreateTokenInstructions(args);

      expect(getInitializeMintInstruction).toHaveBeenCalledWith(
        expect.objectContaining({
          mintAuthority: mockMintAuthority.address,
          freezeAuthority: mockFreezeAuthority.address,
        }),
        {
          programAddress: TOKEN_PROGRAM_ADDRESS,
        },
      );
    });

    it("should add metadata instruction when metadata is provided", () => {
      const metadata: GetCreateTokenInstructionsArgs["metadata"] = {
        name: "Test Token",
        symbol: "TEST",
        uri: "https://example.com/metadata.json",
        isMutable: false,
      };

      const args: GetCreateTokenInstructionsArgs = {
        feePayer: mockPayer,
        mint: mockMint,
        metadataAddress: mockMetadataAddress,
        metadata,
      };

      const instructions = getCreateTokenInstructions(args);

      expect(instructions).toHaveLength(3);
      expect(instructions[2]).toBe(mockCreateMetadataInstruction);

      expect(getCreateMetadataAccountV3Instruction).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: mockMetadataAddress,
          mint: mockMint.address,
          mintAuthority: mockPayer,
          payer: mockPayer,
          updateAuthority: mockPayer,
          data: {
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadata.uri,
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null,
          },
          isMutable: false,
          collectionDetails: null,
        }),
      );
    });

    it("should use custom metadata update authority", () => {
      const customUpdateAuthority = { address: "customUpdateAuth" } as KeyPairSigner;

      const args: GetCreateTokenInstructionsArgs = {
        feePayer: mockPayer,
        mint: mockMint,
        metadataAddress: mockMetadataAddress,
        updateAuthority: customUpdateAuthority,
        metadata,
      };

      getCreateTokenInstructions(args);

      expect(getCreateMetadataAccountV3Instruction).toHaveBeenCalledWith(
        expect.objectContaining({
          updateAuthority: customUpdateAuthority,
        }),
      );
    });
  });

  describe("should use token22 program", () => {
    it("should use Token-2022 program when specified", () => {
      const args: GetCreateTokenInstructionsArgs = {
        feePayer: mockPayer,
        mint: mockMint,
        metadataAddress: mockMint.address,
        tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
        metadata,
      };

      getCreateTokenInstructions(args);

      expect(getCreateAccountInstruction).toHaveBeenCalledWith(
        expect.objectContaining({
          space: MOCK_SPACE,
          programAddress: TOKEN_2022_PROGRAM_ADDRESS,
        }),
      );

      expect(getInitializeMintInstruction).toHaveBeenCalledWith(
        expect.objectContaining({
          mint: mockMint.address,
        }),
        {
          programAddress: TOKEN_2022_PROGRAM_ADDRESS,
        },
      );
    });

    it("should use custom decimals when provided", () => {
      const args: GetCreateTokenInstructionsArgs = {
        feePayer: mockPayer,
        mint: mockMint,
        metadataAddress: mockMint.address,
        decimals: 6,
        metadata,
        tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
      };

      getCreateTokenInstructions(args);

      expect(getInitializeMintInstruction).toHaveBeenCalledWith(
        expect.objectContaining({
          mint: mockMint.address,
          decimals: 6,
        }),
        {
          programAddress: TOKEN_2022_PROGRAM_ADDRESS,
        },
      );
    });

    it("should use custom mint and freeze authorities when provided", () => {
      const args: GetCreateTokenInstructionsArgs = {
        feePayer: mockPayer,
        mint: mockMint,
        metadataAddress: mockMint.address,
        metadata,
        mintAuthority: mockMintAuthority,
        freezeAuthority: mockFreezeAuthority.address,
        tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
      };

      getCreateTokenInstructions(args);

      expect(getInitializeMintInstruction).toHaveBeenCalledWith(
        expect.objectContaining({
          mintAuthority: mockMintAuthority.address,
          freezeAuthority: mockFreezeAuthority.address,
        }),
        {
          programAddress: TOKEN_2022_PROGRAM_ADDRESS,
        },
      );
    });

    it("should add metadata instruction when metadata is provided", () => {
      const metadata: GetCreateTokenInstructionsArgs["metadata"] = {
        name: "Test Token22",
        symbol: "TEST",
        uri: "https://example.com/metadata.json",
        isMutable: false,
      };

      const args: GetCreateTokenInstructionsArgs = {
        feePayer: mockPayer,
        mint: mockMint,
        metadataAddress: mockMint.address,
        metadata,
        tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
      };

      const instructions = getCreateTokenInstructions(args);

      expect(instructions).toHaveLength(4);
      expect(instructions[1]).toBe(mockInitializeMetadataPointerInstruction);
      expect(instructions[3]).toBe(mockInitializeTokenMetadataInstruction);

      expect(getInitializeMetadataPointerInstruction).toHaveBeenCalledWith(
        expect.objectContaining({
          mint: mockMint.address,
          metadataAddress: mockMint.address,
          authority: mockPayer.address,
        }),
      );

      expect(getInitializeMintInstruction).toHaveBeenCalledWith(
        expect.objectContaining({
          mint: mockMint.address,
          mintAuthority: mockPayer.address,
        }),
        {
          programAddress: TOKEN_2022_PROGRAM_ADDRESS,
        },
      );

      expect(getInitializeTokenMetadataInstruction).toHaveBeenCalledWith(
        expect.objectContaining({
          mint: mockMint.address,
          metadata: mockMint.address,
          mintAuthority: mockPayer,
          updateAuthority: mockPayer.address,
          name: metadata.name,
          symbol: metadata.symbol,
          uri: metadata.uri,
        }),
      );
    });

    it("should use custom metadata update authority", () => {
      const customUpdateAuthority = { address: "customUpdateAuth" } as KeyPairSigner;

      const args: GetCreateTokenInstructionsArgs = {
        feePayer: mockPayer,
        mint: mockMint,
        metadataAddress: mockMint.address,
        updateAuthority: customUpdateAuthority,
        metadata,
        tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
      };

      const instructions = getCreateTokenInstructions(args);

      expect(instructions).toHaveLength(4);
      expect(instructions[1]).toBe(mockInitializeMetadataPointerInstruction);
      expect(instructions[3]).toBe(mockInitializeTokenMetadataInstruction);

      expect(getInitializeMetadataPointerInstruction).toHaveBeenCalledWith(
        expect.objectContaining({
          mint: mockMint.address,
          metadataAddress: mockMint.address,
        }),
      );

      expect(getInitializeTokenMetadataInstruction).toHaveBeenCalledWith(
        expect.objectContaining({
          updateAuthority: customUpdateAuthority.address,
        }),
      );
    });
  });
});
