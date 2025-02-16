import type { Address } from "@solana/addresses";
import type { KeyPairSigner } from "@solana/signers";
import { findAssociatedTokenPda, TOKEN_PROGRAM_ADDRESS } from "@solana-program/token";
import { TOKEN_2022_PROGRAM_ADDRESS } from "@solana-program/token-2022";

/**
 * Derive the Associated Token Account (ata) address for a wallet/owner and mint
 *
 * @argument `mint` - the token mint itself
 * @argument `owner` - destination wallet address to own tokens from `mint`
 * @argument `tokenProgram` - token program that the token `mint` was created with
 *
 * - (default) {@link TOKEN_PROGRAM_ADDRESS} - the original SPL Token Program
 * - {@link TOKEN_2022_PROGRAM_ADDRESS} - the SPL Token Extensions Program (aka Token22)
 */
export async function getTokenAccountAddress(
  mint: Address | KeyPairSigner,
  owner: Address | KeyPairSigner,
  tokenProgram?: Address,
): Promise<Address> {
  return (
    await findAssociatedTokenPda({
      mint: "address" in mint ? mint.address : mint,
      owner: "address" in owner ? owner.address : owner,
      tokenProgram: checkedTokenProgramAddress(tokenProgram),
    })
  )[0];
}

export function assertIsSupportedTokenProgram(
  tokenProgram: Address,
): asserts tokenProgram is Address<typeof tokenProgram> {
  if (tokenProgram !== TOKEN_PROGRAM_ADDRESS && tokenProgram !== TOKEN_2022_PROGRAM_ADDRESS) {
    throw Error(
      "Unsupported token program. Try 'TOKEN_PROGRAM_ADDRESS' or 'TOKEN_2022_PROGRAM_ADDRESS'",
    );
  }
}

/**
 * Check the provided program is one of the supported token programs.
 * Including setting the default to {@link TOKEN_PROGRAM_ADDRESS} (the original SPL token program)
 *
 * @example
 * ```
 * args.tokenProgram = checkedTokenProgramAddress(args.tokenProgram);
 * ```
 */
export function checkedTokenProgramAddress(tokenProgram?: Address): Address {
  if (!tokenProgram) return TOKEN_PROGRAM_ADDRESS;
  assertIsSupportedTokenProgram(tokenProgram);
  return tokenProgram;
}
