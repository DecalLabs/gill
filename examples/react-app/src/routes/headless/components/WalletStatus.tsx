import type { Wallet } from '@hermis/solana-headless-react'
import { Card } from '../../../components/Card'

interface WalletStatusProps {
  wallet: Wallet | null
  publicKey: { toBase58: () => string } | null
  onDisconnect: () => void
}

export function WalletStatus({ wallet, publicKey, onDisconnect }: WalletStatusProps) {
  return (
    <Card title="Wallet Status">
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-600">Connected with:</span>
            <span className="font-semibold">{wallet?.adapter.name}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Public Key:</span>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1 break-all">
              {publicKey?.toBase58()}
            </p>
          </div>
        </div>
        <button
          onClick={onDisconnect}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    </Card>
  )
}