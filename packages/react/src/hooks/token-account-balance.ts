"use client";

import { useQuery } from "@tanstack/react-query";
import type { Address, GetTokenAccountBalanceApi, Simplify } from "gill";
import { GILL_HOOK_CLIENT_KEY } from "../const";
import { useSolanaClient } from "./client";
import type { GillUseRpcHook } from "./types";

type RpcConfig = Simplify<Parameters<GetTokenAccountBalanceApi["getTokenAccountBalance"]>>[1];

type UseTokenAccountBalanceInput<TConfig extends RpcConfig = RpcConfig> = GillUseRpcHook<TConfig> & {
  address: Address | string;
};

type UseTokenAccountBalanceResponse = ReturnType<GetTokenAccountBalanceApi["getTokenAccountBalance"]>;

export function useTokenAccountBalance<TConfig extends RpcConfig = RpcConfig>({
  options,
  config,
  abortSignal,
  address,
}: UseTokenAccountBalanceInput<TConfig>) {
  const { rpc } = useSolanaClient();
  const { data, ...rest } = useQuery({
    networkMode: "offlineFirst",
    ...options,
    enabled: !!address,
    queryKey: [GILL_HOOK_CLIENT_KEY, "getTokenAccountBalance", address],
    queryFn: async () => {
      const { value } = await rpc.getTokenAccountBalance(address as Address, config).send({ abortSignal });
      return value;
    },
  });

  return {
    ...rest,
    balance: data as UseTokenAccountBalanceResponse,
  };
}
