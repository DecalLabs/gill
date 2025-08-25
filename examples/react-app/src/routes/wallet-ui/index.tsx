import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/wallet-ui/')({
  component: WalletUIIndexComponent,
})

function WalletUIIndexComponent() {
  return <div>Wallet UI example content</div>
}