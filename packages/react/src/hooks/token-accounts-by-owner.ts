"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  AccountInfoBase,
  AccountInfoWithBase58Bytes,
  AccountInfoWithBase58EncodedData,
  AccountInfoWithBase64EncodedData,
  AccountInfoWithBase64EncodedZStdCompressedData,
  AccountInfoWithJsonData,
  AccountInfoWithPubkey,
  Address,
  GetTokenAccountsByOwnerApi,
  Simplify,
  SolanaRpcResponse,
} from "gill";
import { GILL_HOOK_CLIENT_KEY } from "../const";
import { useSolanaClient } from "./client";
import type { GillUseRpcHook } from "./types";

type Encoding = "base64" | "jsonParsed" | "base64+zstd" | "base58";

type RpcConfig = Simplify<
  Parameters<GetTokenAccountsByOwnerApi["getTokenAccountsByOwner"]>[2] &
    Readonly<{
      encoding?: Encoding;
    }>
>;

type UseTokenAccountsByOwnerInput<TConfig extends RpcConfig = RpcConfig> = GillUseRpcHook<TConfig> & {
  /**
   * Address of account to fetch token accounts of
   */
  owner: Address | string;
  /**
   * Filter by mint or programId
   */
  filter: { mint: Address | string } | { programId: Address | string };
};

type UseTokenAccountsByOwnerResponse<TConfig extends RpcConfig> = TConfig extends {
  encoding: "base64"
}
  ? SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedData>[]>
  : TConfig extends { encoding: "base64+zstd" }
    ? SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData>[]>
    : TConfig extends { encoding: "jsonParsed" }
      ? SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithJsonData>[]>
      : TConfig extends { encoding: "base58" }
        ? SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58EncodedData>[]>
        : SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58Bytes>[]>;

/**
* Get all SPL Token accounts by token owner using the Solana RPC method of
* [getTokenAccountsByOwner](https://solana.com/docs/rpc/http/gettokenaccountsbyowner)
*/
export function useTokenAccountsByOwner<TConfig extends RpcConfig = RpcConfig>({
  options,
  config,
  abortSignal,
  owner,
  filter,
}: UseTokenAccountsByOwnerInput<TConfig>) {
  const { rpc } = useSolanaClient();

  const { data, ...rest } = useQuery({
    ...options,
    enabled: !!owner && !!filter,
    queryKey: [GILL_HOOK_CLIENT_KEY, "getTokenAccountsByOwner", owner, filter],
    queryFn: async () => {
      const tokenAccounts = await rpc.getTokenAccountsByOwner(
        owner as Address, 
        'mint' in filter
          ? { mint: filter.mint as Address }
          : { programId: filter.programId as Address },
        config
      ).send({ abortSignal });
      return tokenAccounts;
    },
  });

  return {
    ...rest,
    tokenAccounts: data as Simplify<UseTokenAccountsByOwnerResponse<TConfig>>,
  };
}
