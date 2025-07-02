"use client";

import { useQuery } from "@tanstack/react-query";
import type { GetSlotApi, Simplify } from "gill";
import { GILL_HOOK_CLIENT_KEY } from "../const";
import { useSolanaClient } from "./client";
import type { GillUseRpcHook } from "./types";

type RpcConfig = Simplify<Parameters<GetSlotApi["getSlot"]>>[0];

type UseSlotResponse = ReturnType<GetSlotApi["getSlot"]>;

type UseSlotInput<TConfig extends RpcConfig = RpcConfig> = GillUseRpcHook<TConfig>;

/**
 * Get the current slot using the Solana RPC method of
 * [`getSlot`](https://solana.com/docs/rpc/http/getslot)
 *
 * To auto refetch the slot, provide a `options.refetchInterval` value
 */
export function useSlot<TConfig extends RpcConfig = RpcConfig>({
  options,
  config,
  abortSignal,
}: UseSlotInput<TConfig> = {}) {
  const { rpc } = useSolanaClient();

  const { data, ...rest } = useQuery({
    ...options,
    queryKey: [GILL_HOOK_CLIENT_KEY, "getSlot"],
    queryFn: async () => {
      const slot = await rpc.getSlot(config).send({ abortSignal });
      return slot;
    },
  });

  return {
    ...rest,
    slot: data as UseSlotResponse,
  };
}
