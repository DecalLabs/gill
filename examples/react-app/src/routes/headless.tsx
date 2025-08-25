import { Outlet, createFileRoute } from '@tanstack/react-router'
import { HermisProvider } from '@hermis/solana-headless-react'
import { WalletAdapterNetwork } from '@hermis/solana-headless-core'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
  CoinbaseWalletAdapter,
} from '@solana/wallet-adapter-wallets'

export const Route = createFileRoute('/headless')({
  component: HeadlessLayout,
})

function HeadlessLayout() {
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new TrustWalletAdapter(),
    new CoinbaseWalletAdapter(),
  ]

  const errorHandler = (error: Error) => {
    console.error('Wallet error:', error)
  }

  return (
    <HermisProvider
      rpcEndpoint="https://api.devnet.solana.com"
      network={WalletAdapterNetwork.Devnet}
      autoConnect={true}
      additionalAdapters={wallets}
      onError={errorHandler}
    >
      <Outlet />
    </HermisProvider>
  )
}