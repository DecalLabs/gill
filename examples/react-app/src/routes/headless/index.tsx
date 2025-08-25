import { createFileRoute } from '@tanstack/react-router'
import { useWallet } from '@hermis/solana-headless-react'
import { ConnectCard } from './components/ConnectCard'
import { WalletStatus } from './components/WalletStatus'
import { BalanceCard } from './components/BalanceCard'

export const Route = createFileRoute('/headless/')({
  component: HeadlessIndexComponent,
})

function HeadlessIndexComponent() {
  const { 
    wallet, 
    publicKey, 
    connecting, 
    connected, 
    connect, 
    disconnect, 
    select,
    wallets
  } = useWallet()
  
  const handleConnect = async (walletName: string) => {
    select(walletName as any)
    await connect()
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Solana Headless Wallet Demo</h1>
      
      {!connected ? (
        <ConnectCard 
          wallets={wallets}
          onConnect={handleConnect}
          connecting={connecting}
        />
      ) : (
        <>
          <WalletStatus 
            wallet={wallet}
            publicKey={publicKey}
            onDisconnect={disconnect}
          />
          <BalanceCard />
        </>
      )}
    </div>
  )
}