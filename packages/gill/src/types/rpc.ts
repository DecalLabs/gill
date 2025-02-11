import type {
  createSolanaRpc,
  RpcTransportFromClusterUrl,
  SolanaRpcApiFromTransport,
  RpcFromTransport,
} from "@solana/rpc";
import type {
  createSolanaRpcSubscriptions,
  RpcSubscriptions,
  SolanaRpcSubscriptionsApi,
} from "@solana/rpc-subscriptions";
import type { DevnetUrl, MainnetUrl, TestnetUrl } from "@solana/rpc-types";
import { SendAndConfirmTransactionWithBlockhashLifetimeFunction } from "../kit";

/** Solana cluster moniker */
export type SolanaClusterMoniker = "mainnet" | "devnet" | "testnet" | "localnet";

export type LocalnetUrl = string & { "~cluster": "localnet" };

export type GenericUrl = string & {};

export type ModifiedClusterUrl = MainnetUrl | DevnetUrl | TestnetUrl | LocalnetUrl | GenericUrl;

export type CreateSolanaClientArgs<
  TClusterUrl extends ModifiedClusterUrl | SolanaClusterMoniker = GenericUrl,
> = {
  /** Full RPC URL (for a private RPC endpoint) or the Solana moniker (for a public RPC endpoint) */
  urlOrMoniker: SolanaClusterMoniker | TClusterUrl | URL | ModifiedClusterUrl;
  /** Configuration used to create the `rpc` client */
  rpcConfig?: Parameters<typeof createSolanaRpc>[1];
  /** Configuration used to create the `rpcSubscriptions` client */
  rpcSubscriptionsConfig?: Parameters<typeof createSolanaRpcSubscriptions>[1];
};

export type CreateSolanaClientResult<TClusterUrl extends ModifiedClusterUrl | string = string> = {
  /** Used to make RPC calls to your RPC provider */
  rpc: RpcFromTransport<
    SolanaRpcApiFromTransport<RpcTransportFromClusterUrl<TClusterUrl>>,
    RpcTransportFromClusterUrl<TClusterUrl>
  >;
  /** Used to make RPC websocket calls to your RPC provider */
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi> & TClusterUrl;
  /**
   * Send and confirm a transaction to the network
   *
   * Default commitment level: `confirmed`
   */
  sendAndConfirmTransaction: SendAndConfirmTransactionWithBlockhashLifetimeFunction;
};
