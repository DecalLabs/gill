"use client";

import { useQuery } from "@tanstack/react-query";
import { Address, GetSignaturesForAddressApi, Simplify } from "gill";
import { GILL_HOOK_CLIENT_KEY } from "../const";
import { useSolanaClient } from "./client";
import { GillUseRpcHook } from "./types";

type RpcConfig = Simplify<Parameters<GetSignaturesForAddressApi["getSignaturesForAddress"]>[1]>;

type UseSignaturesForAddressInput<TConfig extends RpcConfig = RpcConfig> = GillUseRpcHook<TConfig> & {
  /**
   * Address of the account to fetch signatures of
   */
  address: Address | string;
};

type UseSignaturesForAddressResponse = ReturnType<GetSignaturesForAddressApi["getSignaturesForAddress"]>;

/**
 * Returns signatures for confirmed transactions that include the given address
 * in their accountKeys list. Returns signatures backwards in time from the
 * provided signature or most recent confirmed block using the Solana RPC method of
 * [`getsignaturesforaddress`](https://solana.com/docs/rpc/http/getsignaturesforaddress)
 */
export function useSignaturesForAddress<TConfig extends RpcConfig = RpcConfig>({
  options,
  config,
  abortSignal,
  address,
}: UseSignaturesForAddressInput<TConfig>) {
  const { rpc } = useSolanaClient();
  const { data, ...rest } = useQuery({
    networkMode: "offlineFirst",
    ...options,
    enabled: !!address,
    queryKey: [GILL_HOOK_CLIENT_KEY, "getSignaturesForAddress", address],
    queryFn: async () => {
      const signatures = await rpc.getSignaturesForAddress(address as Address, config).send({ abortSignal });
      return signatures;
    },
  });
  return {
    ...rest,
    signatures: data as UseSignaturesForAddressResponse,
  };
}
