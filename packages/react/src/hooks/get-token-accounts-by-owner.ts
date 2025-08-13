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

type Encoding = "base58" | "base64" | "base64+zstd" | "jsonParsed";

type AccountsFilter = Parameters<GetTokenAccountsByOwnerApi["getTokenAccountsByOwner"]>[1];

type RpcConfig = Simplify<
  NonNullable<Parameters<GetTokenAccountsByOwnerApi["getTokenAccountsByOwner"]>[2]> & Readonly<{ encoding?: Encoding }>
>;

type UseTokenAccountsByOwnerInput<TConfig extends RpcConfig = RpcConfig> = GillUseRpcHook<TConfig> & {
  /**
   * Filter to select which token accounts are returned (e.g. by `mint` or `programId`)
   */
  filter: AccountsFilter;
  /**
   * Address of the owner whose token accounts should be returned
   */
  owner: Address | string;
};

type UseTokenAccountsByOwnerResponse<TConfig extends RpcConfig> = TConfig extends {
  encoding: "base64";
  withContext: true;
}
  ? SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedData>[]>
  : TConfig extends { encoding: "base64" }
    ? AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedData>[]
    : TConfig extends { encoding: "base64+zstd"; withContext: true }
      ? SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData>[]>
      : TConfig extends { encoding: "base64+zstd" }
        ? AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase64EncodedZStdCompressedData>[]
        : TConfig extends { encoding: "jsonParsed"; withContext: true }
          ? SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithJsonData>[]>
          : TConfig extends { encoding: "jsonParsed" }
            ? AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithJsonData>[]
            : TConfig extends { encoding: "base58"; withContext: true }
              ? SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58EncodedData>[]>
              : TConfig extends { encoding: "base58" }
                ? AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58EncodedData>[]
                : TConfig extends { withContext: true }
                  ? SolanaRpcResponse<AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58Bytes>[]>
                  : AccountInfoWithPubkey<AccountInfoBase & AccountInfoWithBase58Bytes>[];

/**
 * Get all SPL token accounts owned by `owner` using the Solana RPC method of
 * `getTokenAccountsByOwner`
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
    enabled: !!owner,
    queryFn: async () => {
      const accounts = await rpc.getTokenAccountsByOwner(owner as Address, filter, config).send({ abortSignal });
      return accounts;
    },
    queryKey: [GILL_HOOK_CLIENT_KEY, "getTokenAccountsByOwner", { filter, owner }],
  });

  return {
    ...rest,
    accounts: data as Simplify<UseTokenAccountsByOwnerResponse<TConfig>>,
  };
}
