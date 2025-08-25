import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/wallet-ui')({
  component: WalletUILayout,
})

function WalletUILayout() {
  return (
    <div>
      <Outlet />
    </div>
  )
}