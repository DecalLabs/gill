import type { Wallet } from '@hermis/solana-headless-react'
import { Card } from '../../../components/Card'

interface ConnectCardProps {
  wallets: Wallet[]
  onConnect: (walletName: string) => void
  connecting: boolean
}

export function ConnectCard({ wallets, onConnect, connecting }: ConnectCardProps) {
  return (
    <Card title="Connect Wallet">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {wallets.map((wallet) => (
          <button
            key={wallet.adapter.name}
            onClick={() => onConnect(wallet.adapter.name)}
            disabled={connecting}
            className="flex items-center justify-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {wallet.adapter.icon && (
              <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-6 h-6" />
            )}
            {connecting && wallet.adapter.name === wallets.find(w => w === wallet)?.adapter.name 
              ? 'Connecting...' 
              : wallet.adapter.name}
          </button>
        ))}
      </div>
    </Card>
  )
}