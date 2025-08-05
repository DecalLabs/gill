"use client";

import { useQuery } from "@tanstack/react-query";
import type { Base64EncodedWireTransaction, SendTransactionApi, Simplify } from "gill";
import { GILL_HOOK_CLIENT_KEY } from "../const";
import { useSolanaClient } from "./client";
import type { GillUseRpcHook } from "./types";

type RpcConfig = Simplify<Parameters<SendTransactionApi["sendTransaction"]>[1]>;

type UseSendTransactionInput<TConfig extends RpcConfig = RpcConfig> = GillUseRpcHook<TConfig> & {
  /**
   * A fully signed transaction in wire format, as a base64 encoded string
   */
  transaction: Base64EncodedWireTransaction | string;
}

type UseSendTransactionResponse = ReturnType<SendTransactionApi["sendTransaction"]>;

/**
 * Submits a signed transaction to the cluster for processing.
 * 
 * Default `config`:
 * - encoding: "base64"
 * - preflightCommitment: "finalized"
 * - skipPreflight: false
 */
export function useSendTransaction<TConfig extends RpcConfig = RpcConfig>({
  options,
  config,
  abortSignal,
  transaction,
}: UseSendTransactionInput<TConfig>) {
  const { rpc } = useSolanaClient();

  const { data, ...rest } = useQuery({
    networkMode: "always",
    ...options,
    enabled: !!transaction,
    queryKey: [GILL_HOOK_CLIENT_KEY, "sendTransaction", transaction],
    queryFn: async () => {
      const result = await rpc.sendTransaction(transaction as Base64EncodedWireTransaction,
        {
          preflightCommitment: "finalized",
          skipPreflight: false,
          ...(config || {}),
          encoding: "base64", // Always ensure encoding is `base64` as required in `SendTransactionApi`
        }).send({ abortSignal });
      return result;
    }
  });
  return {
    ...rest,
    signature: data as UseSendTransactionResponse,
  };
}