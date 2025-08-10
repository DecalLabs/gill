import type { Mint, Token } from "@solana-program/token-2022";
import { decodeToken, fetchMint } from "@solana-program/token-2022";
import type { Account, Address, GetAccountInfoApi, GetTokenAccountsByOwnerApi, Rpc } from "@solana/kit";
import {
  isAddress,
  parseBase64RpcAccount,
  SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND,
  SOLANA_ERROR__ACCOUNTS__FAILED_TO_DECODE_ACCOUNT,
  SolanaError,
} from "@solana/kit";

export function assertIsMint<TAddress extends string = string>(
  accountOrAddress: Account<Mint, TAddress> | Address<TAddress>,
): asserts accountOrAddress is Account<Mint, TAddress> {
  if (isAddress(accountOrAddress as Address)) {
    throw new SolanaError(SOLANA_ERROR__ACCOUNTS__ACCOUNT_NOT_FOUND, { address: accountOrAddress as Address });
  }

  if ("data" in accountOrAddress === false || "mintAuthority" in accountOrAddress.data === false) {
    throw new SolanaError(SOLANA_ERROR__ACCOUNTS__FAILED_TO_DECODE_ACCOUNT, { address: accountOrAddress as Address });
  }
}

export type FetchTokenAccountsConfig = Omit<
  Parameters<GetTokenAccountsByOwnerApi["getTokenAccountsByOwner"]>["2"],
  "encoding"
> & {
  abortSignal?: AbortSignal;
};

/**
 * Fetch all the the token accounts for a given `mint` and `owner` Address. Automatically fetching
 * the Mint account itself and calculating the total balance of all the `owner`'s token accounts.
 *
 * @example
 * ```typescript
 * const { mint, accounts, totalBalance } = await fetchTokenAccounts(
 *    rpc,
 *    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" as Address, // (mint for USDC on mainnet)
 *    "GQuioVe2yA6KZfstgmirAvugfUZBcdxSi7sHK7JGk3gk" as Address, // owner address
 * );
 * ```
 */
export async function fetchTokenAccounts<TMintAddress extends string = string, TOwner extends string = string>(
  rpc: Rpc<GetTokenAccountsByOwnerApi & GetAccountInfoApi>,
  mint: Address<TMintAddress> | Account<Mint>,
  owner: Address<TOwner>,
  config: FetchTokenAccountsConfig = {},
): Promise<{ accounts: Account<Token>[]; mint: Account<Mint>; totalBalance: bigint }> {
  if (isAddress(mint as Address)) mint = await fetchMint(rpc, mint as Address);
  assertIsMint(mint);
  const { abortSignal, ...rpcConfig } = config;
  const { value } = await rpc
    .getTokenAccountsByOwner(owner, { mint: mint.address }, { ...rpcConfig, encoding: "base64" })
    .send({ abortSignal });
  let totalBalance: bigint = 0n;
  const accounts = value.map((account) => {
    const decoded = decodeToken(parseBase64RpcAccount(account.pubkey, account.account));
    totalBalance += decoded.data.amount;
    return decoded;
  });
  return {
    mint,
    totalBalance,
    accounts,
  };
}
