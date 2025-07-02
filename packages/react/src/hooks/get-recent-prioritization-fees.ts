"use client";
import { useQuery } from "@tanstack/react-query";
import type { GetRecentPrioritizationFeesApi, Simplify } from "gill";
import { GILL_HOOK_CLIENT_KEY } from "../const";
import { useSolanaClient } from "./client";
import type { GillUseRpcHook } from "./types";

type UseRecentPrioritizationFeesInput = Simplify<
  {
    addresses: Parameters<GetRecentPrioritizationFeesApi["getRecentPrioritizationFees"]>[0];
  } & Pick<GillUseRpcHook<{}>, "options" | "abortSignal">
>;
type UseRecentPrioritizationFeesResponse = ReturnType<GetRecentPrioritizationFeesApi["getRecentPrioritizationFees"]>;

/**
 * Get the recent prioritization fees for a list of addresses using the Solana RPC method of
 * [`getRecentPrioritizationFees`](https://solana.com/docs/rpc/http/getrecentprioritizationfees)
 */
export function useRecentPrioritizationFees({ options, abortSignal, addresses }: UseRecentPrioritizationFeesInput) {
  const { rpc } = useSolanaClient();

  const { data, ...rest } = useQuery({
    ...options,
    queryKey: [GILL_HOOK_CLIENT_KEY, "getRecentPrioritizationFees", addresses],
    queryFn: async () => {
      const fees = await rpc.getRecentPrioritizationFees(addresses).send({ abortSignal });
      return fees;
    },
  });

  return {
    ...rest,
    fees: data as UseRecentPrioritizationFeesResponse,
  };
}
