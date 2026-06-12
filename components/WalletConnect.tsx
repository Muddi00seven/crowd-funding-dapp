'use client'

// Import React hooks
import { useEffect, useState } from 'react'

// AppKit hooks to connect and read wallet state
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'

// ethers.js to read balance from the blockchain
import { BrowserProvider } from 'ethers'
import type { Eip1193Provider } from 'ethers'

export function WalletConnect() {

  // open() → opens the wallet popup (connect / account view)
  const { open } = useAppKit()

  // address → the user's wallet address, e.g. "0xAbc...1234"
  // isConnected → true when a wallet is connected
  const { address, isConnected } = useAppKitAccount()

  // walletProvider → the raw EIP-1193 provider from the connected wallet
  const { walletProvider } = useAppKitProvider<Eip1193Provider>('eip155')

  // Stores the ETH balance as a string, e.g. "0.0412"
  const [balance, setBalance] = useState<string | null>(null)

  // True while the balance is being fetched
  const [loadingBalance, setLoadingBalance] = useState(false)

  // Fetch balance whenever wallet connects or changes
  useEffect(() => {

    // If wallet is not connected, clear the balance and exit
    if (!isConnected || !walletProvider || !address) {
      setBalance(null)
      return
    }

    const fetchBalance = async () => {
      setLoadingBalance(true)
      try {
        // Wrap the wallet provider with ethers so we can call getBalance
        const provider = new BrowserProvider(walletProvider)

        // Balance comes back in Wei (1 ETH = 10^18 Wei)
        const balanceInWei = await provider.getBalance(address)

        // Convert Wei to ETH and round to 4 decimal places
        const balanceInEth = Number(balanceInWei) / 1e18
        setBalance(balanceInEth.toFixed(4))
      } catch {
        setBalance('—') // Show a dash if something goes wrong
      } finally {
        setLoadingBalance(false)
      }
    }

    fetchBalance()
  }, [isConnected, walletProvider, address])

  // Shorten the address for display: "0xAbcd...5678"
  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ''

  // --- UI ---

  return (
    <button
      onClick={() => isConnected && address ? open({ view: 'Account' }) : open()}
      className={
        isConnected && address
          ? "px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
          : "px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
      }
    >
      {isConnected && address
        ? (loadingBalance ? '...' : `${balance} ETH · ${shortAddress}`)
        : 'Connect Wallet'
      }
    </button>
  )
}
