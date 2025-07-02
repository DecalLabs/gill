"use client";
import { useQuery } from "@tanstack/react-query";
import type { SimulateTransactionApi, Signature, Simplify, Base64EncodedWireTransaction } from "gill";
import { GILL_HOOK_CLIENT_KEY } from "../const";
import { useSolanaClient } from "./client";
import type { GillUseRpcHook } from "./types";
// notes since config is required in this hook should we have a default config data or take the config explicitly from the user.
type RpcConfig = Simplify<Parameters<SimulateTransactionApi["simulateTransaction"]>>[1];

type UseSimulateTransactionInput<TConfig extends RpcConfig = RpcConfig> = Omit<GillUseRpcHook<TConfig>, "config"> & {
  transaction: Base64EncodedWireTransaction;
  config: TConfig;
};

type UseSimulateTransactionResponse = ReturnType<SimulateTransactionApi["simulateTransaction"]>;

/**
 * Simulate a transaction using the Solana RPC method of
 * [`simulateTransaction`](https://solana.com/docs/rpc/http/simulatetransaction)
 */
export function useSimulateTransaction<TConfig extends RpcConfig = RpcConfig>({
  options,
  config,
  abortSignal,
  transaction,
}: UseSimulateTransactionInput<TConfig>) {
  const { rpc } = useSolanaClient();

  const { data, ...rest } = useQuery({
    ...options,
    enabled: !!transaction,
    queryKey: [GILL_HOOK_CLIENT_KEY, "simulateTransaction", transaction],
    queryFn: async () => {
      const simulation = await rpc.simulateTransaction(transaction, config).send({ abortSignal });
      return simulation;
    },
  });

  return {
    ...rest,
    simulation: data as UseSimulateTransactionResponse,
  };
}
