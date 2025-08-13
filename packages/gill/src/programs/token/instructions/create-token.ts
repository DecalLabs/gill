import { getCreateAccountInstruction } from "@solana-program/system";
import type { Address, Instruction, KeyPairSigner, TransactionSigner } from "@solana/kit";
import { checkedAddress, checkedTransactionSigner, getMinimumBalanceForRentExemption } from "../../../core";
import { getCreateMetadataAccountV3Instruction, getTokenMetadataAddress } from "../../token-metadata";

import {
  extension,
  getInitializeMetadataPointerInstruction,
  getInitializeMintInstruction,
  getInitializeTokenMetadataInstruction,
  getMintSize,
  TOKEN_2022_PROGRAM_ADDRESS,
} from "@solana-program/token-2022";
import { checkedTokenProgramAddress } from "../addresses";
import type { TokenInstructionBase } from "./types";

export type GetCreateTokenInstructionsArgs = TokenInstructionBase<KeyPairSigner> & {
  /**
   * The number of decimal places this token should have
   *
   * @default `9` - the most commonly used decimals value
   **/
  decimals?: bigint | number;
  /**
   * Authority address that is allowed to mint new tokens
   *
   * When not provided, defaults to: `feePayer`
   **/
  mintAuthority?: TransactionSigner;
  /**
   * Authority address that is able to freeze (and thaw) user owned token accounts.
   * When a user's token account is frozen, they will not be able to transfer their tokens.
   *
   * When not provided, defaults to: `null`
   **/
  freezeAuthority?: Address | TransactionSigner;
  /**
   * Authority address that is allowed to update the metadata
   *
   * When not provided, defaults to: `feePayer`
   **/
  updateAuthority?: TransactionSigner;
  /**
   * Optional (but highly recommended) metadata to attach to this token
   */
  metadata: {
    /** Name of this token */
    name: string;
    /** Symbol for this token */
    symbol: string;
    /** URI pointing to additional metadata for this token. Typically an offchain json file. */
    uri: string;
    /** Whether or not the onchain metadata will be editable after minting */
    isMutable: boolean;
  };
  /**
   * Metadata address for this token
   *
   * @example
   * For `TOKEN_PROGRAM_ADDRESS` use the {@link getTokenMetadataAddress} function:
   * ```
   * metadataAddress: await getTokenMetadataAddress(mint.address);
   * ```
   *
   * @example
   * For `TOKEN_2022_PROGRAM_ADDRESS` use the mint's address:
   * ```
   * metadataAddress: mint.address;
   * ```
   * */
  metadataAddress: Address;
  // extensions // todo
};

/**
 * Create the instructions required to initialize a new token's mint
 */
export function getCreateTokenInstructions(args: GetCreateTokenInstructionsArgs): Instruction[] {
  args.tokenProgram = checkedTokenProgramAddress(args.tokenProgram);
  args.feePayer = checkedTransactionSigner(args.feePayer);

  if (args.decimals == null) args.decimals = 9;
  if (!args.mintAuthority) args.mintAuthority = args.feePayer;
  if (!args.updateAuthority) args.updateAuthority = args.feePayer;
  if (args.freezeAuthority) args.freezeAuthority = checkedAddress(args.freezeAuthority);

  if (args.tokenProgram === TOKEN_2022_PROGRAM_ADDRESS) {
    const metadataPointer = extension("MetadataPointer", {
      metadataAddress: args.mint.address,
      authority: args.updateAuthority.address,
    });

    const metadataExtensionData = extension("TokenMetadata", {
      updateAuthority: args.updateAuthority.address,
      mint: args.mint.address,
      name: args.metadata.name,
      symbol: args.metadata.symbol,
      uri: args.metadata.uri,
      // todo: support token22 additional metadata
      additionalMetadata: new Map(),
    });

    return [
      getCreateAccountInstruction({
        payer: args.feePayer,
        newAccount: args.mint,
        /**
         * token22 requires only the pre-mint-initialization extensions (like metadata pointer)
         * to be the `space`. then it will extend the account's space for each applicable extension
         * */
        space: BigInt(getMintSize([metadataPointer])),
        /**
         * token22 requires the total lamport balance for all extensions,
         * including pre-initialization and post-initialization
         */
        lamports: getMinimumBalanceForRentExemption(BigInt(getMintSize([metadataPointer, metadataExtensionData]))),
        programAddress: args.tokenProgram,
      }),
      getInitializeMetadataPointerInstruction({
        authority: args.mintAuthority.address,
        metadataAddress: args.metadataAddress,
        mint: args.mint.address,
      }),
      getInitializeMintInstruction(
        {
          mint: args.mint.address,
          decimals: Number(args.decimals),
          mintAuthority: args.mintAuthority.address,
          freezeAuthority: args.freezeAuthority || null,
        },
        {
          programAddress: args.tokenProgram,
        },
      ),
      getInitializeTokenMetadataInstruction({
        metadata: args.mint.address,
        mint: args.mint.address,
        mintAuthority: args.mintAuthority,
        name: args.metadata.name,
        symbol: args.metadata.symbol,
        uri: args.metadata.uri,
        updateAuthority: args.updateAuthority.address,
      }),
      // todo: support token22 additional metadata by adding that instruction(s) here
    ];
  } else {
    // the token22 `getMintSize` is fully compatible with the original token program
    const space: bigint = BigInt(getMintSize());

    return [
      getCreateAccountInstruction({
        payer: args.feePayer,
        newAccount: args.mint,
        lamports: getMinimumBalanceForRentExemption(space),
        space,
        programAddress: args.tokenProgram,
      }),
      getInitializeMintInstruction(
        {
          mint: args.mint.address,
          decimals: Number(args.decimals),
          mintAuthority: args.mintAuthority.address,
          freezeAuthority: args.freezeAuthority || null,
        },
        {
          programAddress: args.tokenProgram,
        },
      ),
      getCreateMetadataAccountV3Instruction({
        metadata: args.metadataAddress,
        mint: args.mint.address,
        mintAuthority: args.mintAuthority,
        payer: args.feePayer,
        updateAuthority: args.updateAuthority,
        data: {
          name: args.metadata.name,
          symbol: args.metadata.symbol,
          uri: args.metadata.uri,
          sellerFeeBasisPoints: 0,
          creators: null,
          collection: null,
          uses: null,
        },
        isMutable: args.metadata.isMutable,
        collectionDetails: null,
      }),
    ];
  }
}
