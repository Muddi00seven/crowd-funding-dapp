'use client'

import { useEffect, useState } from 'react'
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { BrowserProvider } from 'ethers'
import type { Eip1193Provider } from 'ethers'

export function WalletConnect() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider<Eip1193Provider>('eip155')
  const [balance, setBalance] = useState<string | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(false)

  useEffect(() => {
    if (!isConnected || !walletProvider || !address) {
      setBalance(null)
      return
    }

    const fetchBalance = async () => {
      setLoadingBalance(true)
      try {
        const provider = new BrowserProvider(walletProvider)
        const raw = await provider.getBalance(address)
        // Convert wei → ETH, show 4 decimal places
        const eth = Number(raw) / 1e18
        setBalance(eth.toFixed(4))
      } catch {
        setBalance('—')
      } finally {
        setLoadingBalance(false)
      }
    }

    fetchBalance()
  }, [isConnected, walletProvider, address])

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ''

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm flex flex-col gap-6 shadow-xl">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Wallet</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isConnected ? 'Connected' : 'Connect your wallet to get started'}
          </p>
        </div>

        {isConnected && address ? (
          <div className="flex flex-col gap-4">
            {/* Address */}
            <div className="bg-muted rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">Address</p>
              <p className="font-mono text-sm text-foreground break-all">{address}</p>
            </div>

            {/* Balance */}
            <div className="bg-muted rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">Balance</p>
              <p className="font-mono text-lg font-semibold text-foreground">
                {loadingBalance ? (
                  <span className="text-muted-foreground text-sm">Loading...</span>
                ) : (
                  <>{balance} <span className="text-sm font-normal text-muted-foreground">ETH</span></>
                )}
              </p>
            </div>

            {/* Disconnect */}
            <button
              onClick={() => open({ view: 'Account' })}
              className="w-full py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              {shortAddress} · Manage
            </button>
          </div>
        ) : (
          <button
            onClick={() => open()}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 active:opacity-80 transition-opacity"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  )
}
