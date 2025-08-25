import * as React from 'react'
import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { createSolanaClient } from 'gill'
import { SolanaProvider } from 'gill-react'
import '../index.css'

const client = createSolanaClient({
  urlOrMoniker: 'devnet',
})

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <SolanaProvider client={client}>
      <div className="min-h-screen">
        <nav className="bg-gray-800 text-white p-4">
          <div className="container mx-auto flex gap-6">
            <Link to="/" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link to="/headless" className="hover:text-blue-400 transition-colors">
              Headless
            </Link>
            <Link to="/wallet-ui" className="hover:text-blue-400 transition-colors">
              Wallet UI
            </Link>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          <Outlet />
        </main>
      </div>
    </SolanaProvider>
  )
}
