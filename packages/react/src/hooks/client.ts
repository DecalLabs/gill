import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSolanaClient, type SolanaClient } from "gill";
import { GILL_HOOK_CLIENT_KEY } from "../const";

/**
 * Get the current Solana client (including `rpc` and `rpcSubscriptions`)
 */
export function useSolanaClient(): SolanaClient {
  const { data: config } = useQuery<SolanaClient>({
    queryKey: [GILL_HOOK_CLIENT_KEY],
    staleTime: Infinity,
    // fallback data should not be reached if used within `SolanaProvider`
    // since we set the initial value. but just in case => devnet
    initialData: createSolanaClient({
      urlOrMoniker: "devnet",
    }),
    queryFn: () => {
      throw new Error("useSolanaClient should not be called outside of SolanaProvider");
    },
  });
  return config;
}

/**
 * Update your Solana client (including `rpc` and `rpcSubscriptions`)
 */
export function useUpdateSolanaClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newClient: SolanaClient): Promise<SolanaClient> => {
      queryClient.setQueryData([GILL_HOOK_CLIENT_KEY], newClient);
      return newClient;
    },
    onSuccess: () => {
      // Invalidate any queries that might depend on the Solana client
      queryClient.invalidateQueries({ queryKey: [GILL_HOOK_CLIENT_KEY] });

      /**
       * todo: research more here
       * removing queries here will force the cache to update automatically, but can result in the waterfall of data fetching
       * but it seems that without it, the client side data does not auto refetch when the SolanaClient is changed :/
       */
      // queryClient.removeQueries({
      //   predicate: (query) => {
      //     return query.queryKey.length >= 2 && query.queryKey[0] === GILL_HOOK_CLIENT_KEY;
      //   },
      // });

      queryClient.prefetchQuery({ queryKey: [GILL_HOOK_CLIENT_KEY] });
      queryClient.refetchQueries({
        queryKey: [GILL_HOOK_CLIENT_KEY],
      });
    },
  });
}
