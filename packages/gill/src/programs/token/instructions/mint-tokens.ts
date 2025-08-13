import type { Address, Instruction, TransactionSigner } from "@solana/kit";

import { getCreateAssociatedTokenIdempotentInstruction, getMintToInstruction } from "@solana-program/token-2022";
import { checkedAddress, checkedTransactionSigner } from "../../../core";
import { checkedTokenProgramAddress } from "../addresses";
import type { TokenInstructionBase } from "./types";

export type GetMintTokensInstructionsArgs = TokenInstructionBase & {
  /**
   * The authority address capable of authorizing minting of new tokens.
   *
   * - this should normally by a `TransactionSigner`
   * - only for multi-sig authorities (like Squads Protocol), should you supply an `Address`
   * */
  mintAuthority: TransactionSigner | Address;
  /** Wallet address to receive the tokens being minted, via their associated token account (ata) */
  destination: TransactionSigner | Address;
  /**
   * Associated token account (ata) address for `destination` and this `mint`
   *
   * See {@link getAssociatedTokenAccountAddress}
   *
   * @example
   * ```
   * getAssociatedTokenAccountAddress(mint, destination, tokenProgram);
   * ```
   * */
  ata: Address;
  /** Amount of tokens to mint to the `owner` via their `ata` */
  amount: bigint | number;
};

/**
 * Create the instructions required to mint tokens to any wallet/owner,
 * including creating their ATA if it does not exist
 *
 * @example
 *
 * ```
 * const mint = await generateKeyPairSigner();
 * const destination = address("nicktrLHhYzLmoVbuZQzHUTicd2sfP571orwo9jfc8c");
 *
 * const instructions = getMintTokensInstructions({
 *   mint,
 *   feePayer: signer,
 *   mintAuthority: signer,
 *   amount: 1000, // note: be sure to consider the mint's `decimals` value
 *   // if decimals=2 => this will mint 10.00 tokens
 *   // if decimals=4 => this will mint 0.100 tokens
 *   destination,
 *   // be sure to set the correct token program when getting the `ata`
 *   ata: await getAssociatedTokenAccountAddress(mint, destination, tokenProgram),
 *   // tokenProgram: TOKEN_PROGRAM_ADDRESS, // default
 *   // tokenProgram: TOKEN_2022_PROGRAM_ADDRESS,
 * });
 * ```
 */
export function getMintTokensInstructions(args: GetMintTokensInstructionsArgs): Instruction[] {
  args.tokenProgram = checkedTokenProgramAddress(args.tokenProgram);
  args.feePayer = checkedTransactionSigner(args.feePayer);
  args.mint = checkedAddress(args.mint);

  return [
    // create idempotent will gracefully fail if the ata already exists. this is the gold standard!
    getCreateAssociatedTokenIdempotentInstruction({
      owner: checkedAddress(args.destination),
      mint: args.mint,
      ata: args.ata,
      payer: args.feePayer,
      tokenProgram: args.tokenProgram,
    }),
    getMintToInstruction(
      {
        mint: args.mint,
        mintAuthority: args.mintAuthority,
        token: args.ata,
        amount: args.amount,
      },
      {
        programAddress: args.tokenProgram,
      },
    ),
  ];
}
