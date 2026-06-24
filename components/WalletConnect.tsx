/**
 * components/WalletConnect.tsx
 *
 * The root component — it does three things:
 *   1. Shows a "Connect Wallet" button when no wallet is connected.
 *   2. Once connected, shows the wallet address + ETH balance.
 *   3. Renders the READ and WRITE contract panels below.
 *
 * AppKit hooks used here:
 *   useAppKit()         → open() → opens the wallet selection modal
 *   useAppKitAccount()  → gives us address + isConnected
 *   useAppKitProvider() → gives us the raw EIP-1193 provider
 *
 * What is EIP-1193?
 *   A standard interface that all wallets (MetaMask, Coinbase, etc.) implement.
 *   ethers.js wraps it with BrowserProvider to give us a nicer API.
 */

'use client'

import { useEffect, useState } from 'react'
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { BrowserProvider } from 'ethers'
import type { Eip1193Provider } from 'ethers'

import { CONTRACT_ADDRESS }  from '@/lib/contract'
import { ReadFunctions }     from '@/components/contract/ReadFunctions'
import { WriteFunctions }    from '@/components/contract/WriteFunctions'

export function WalletConnect() {

  // open() → opens the AppKit modal (wallet connect / account view)
  const { open } = useAppKit()

  // address     → the user's wallet address e.g. "0xAbcd...1234", or undefined
  // isConnected → true once a wallet is connected
  const { address, isConnected } = useAppKitAccount()

  // walletProvider → the raw EIP-1193 wallet provider (what ethers wraps)
  const { walletProvider } = useAppKitProvider<Eip1193Provider>('eip155')

  // ETH balance shown in the header button
  const [balance,        setBalance]        = useState<string | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)

  // ── Fetch ETH balance whenever wallet connects or address changes ──────
  useEffect(() => {
    // Nothing to do if wallet isn't connected yet
    if (!isConnected || !walletProvider || !address) {
      setBalance(null)
      return
    }

    async function fetchBalance() {
      setLoadingBalance(true)
      try {
        // Wrap the wallet provider with ethers so we can call getBalance()
        const provider = new BrowserProvider(walletProvider as Eip1193Provider)

        // getBalance() returns Wei (1 ETH = 10^18 Wei)
        const balanceWei = await provider.getBalance(address!)
        const balanceEth = Number(balanceWei) / 1e18
        setBalance(balanceEth.toFixed(4))
      } catch {
        setBalance('—')
      } finally {
        setLoadingBalance(false)
      }
    }

    fetchBalance()
  }, [isConnected, walletProvider, address])

  // Shorten address for display: "0xAbcd1234...5678"
  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ''

  // ── Not connected → show connect button centered on screen ───────────
  if (!isConnected || !address || !walletProvider) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <button
          onClick={() => open()}
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  // ── Connected → show wallet info + contract panels ────────────────────
  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 p-4 font-mono">

      {/* Wallet header — clicking opens the account/disconnect modal */}
      <button
        onClick={() => open({ view: 'Account' })}
        className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {loadingBalance ? '...' : `${balance} ETH · ${shortAddress}`}
      </button>

      {/* Show which contract address we're interacting with */}
      <div className="text-xs text-muted-foreground">
        contract: <span className="text-foreground">{CONTRACT_ADDRESS}</span>
      </div>

      {/* READ functions (view only — no gas, no signature) */}
      <ReadFunctions walletProvider={walletProvider as Eip1193Provider} />

      {/* WRITE functions (state-changing — needs MetaMask + gas) */}
      <WriteFunctions walletProvider={walletProvider as Eip1193Provider} />

    </div>
  )
}
