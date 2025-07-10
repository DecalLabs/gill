"use client";

import { useQuery } from "@tanstack/react-query";
import type { GetTransactionApi, Signature, Simplify } from "gill";
import { GILL_HOOK_CLIENT_KEY } from "../const";
import { useSolanaClient } from "./client";
import type { GillUseRpcHook } from "./types";

type RpcConfig = Simplify<Parameters<GetTransactionApi["getTransaction"]>[1]>;

type UseTransactionResponse = ReturnType<GetTransactionApi["getTransaction"]>;

type UseTransactionInput<TConfig extends RpcConfig = RpcConfig> = GillUseRpcHook<TConfig> & {
  /**
   * Transaction signature as a base-58 encoded string
   */
  signature: Signature | string;
};

/**
 * Get transaction details for a confirmed transaction using the Solana RPC method of
 * [`getTransaction`](https://solana.com/docs/rpc/http/gettransaction)
 * 
 */
export function useTransaction<TConfig extends RpcConfig = RpcConfig>({
  options,
  config,
  abortSignal,
  signature,
}: UseTransactionInput<TConfig>) {
  const { rpc } = useSolanaClient();
  const { data, ...rest } = useQuery({
    networkMode: "offlineFirst",
    ...options,
    enabled: !!signature,
    queryKey: [GILL_HOOK_CLIENT_KEY, "getTransaction", signature],
    queryFn: async () => {
      const response = await rpc.getTransaction(signature as Signature, config).send({ abortSignal });
      return response;
    },
  });
  return {
    ...rest,
    transaction: data as UseTransactionResponse,
  };
}