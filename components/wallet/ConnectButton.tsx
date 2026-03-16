'use client'
import { useState } from 'react'
import { useAccount, useConnect, useDisconnect, useSwitchChain, useChainId } from 'wagmi'
import { motion } from 'framer-motion'
import { Loader2, Wallet, ChevronDown, Copy, LogOut, AlertTriangle, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { truncateAddress } from '@/lib/utils'
import { SUPPORTED_CHAIN_ID } from '@/lib/contract'
import { useTokenBalance } from '@/hooks/useTokenBalance'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const chainId = useChainId()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { formatted: balanceFormatted } = useTokenBalance()

  const isCorrectNetwork = chainId === SUPPORTED_CHAIN_ID

  const copyAddress = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    toast.success("Address copied!")
    setDropdownOpen(false)
  }

  // Not connected
  if (!isConnected) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
            <Button className="bg-primary hover:bg-primary/90" aria-label="Connect wallet">
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </>
              )}
            </Button>
          </motion.div>
        </DialogTrigger>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Wallet Select Karo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                variant="outline"
                className="w-full justify-start border-border hover:border-primary/50"
                onClick={() => connect({ connector })}
                disabled={isPending}
                aria-label={`Connect with ${connector.name}`}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {connector.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Wrong network
  if (!isCorrectNetwork) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Wrong Network
        </Badge>
        <Button
          variant="outline"
          size="sm"
          className="border-destructive text-destructive hover:bg-destructive/10"
          onClick={() => switchChain({ chainId: 11155111 })}
          aria-label="Switch to Sepolia network"
        >
          Switch to Sepolia
        </Button>
      </div>
    )
  }

  // Connected, correct network
  return (
    <div className="relative">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
        <Button
          variant="outline"
          className="border-border hover:border-primary/50 font-mono"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          aria-label="Wallet menu"
        >
          <span className="w-2 h-2 rounded-full bg-success mr-2" />
          {truncateAddress(address!, 4, 4)}
          <ChevronDown className="w-3 h-3 ml-2" />
        </Button>
      </motion.div>

      {dropdownOpen && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border bg-card shadow-lg z-50 overflow-hidden"
        >
          {/* Address + Balance */}
          <div className="p-4 border-b border-border space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Connected address</p>
              <p className="font-mono text-sm break-all">{address}</p>
            </div>
            <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">USDT Balance</span>
              </div>
              <span className="font-semibold text-sm">{balanceFormatted} USDT</span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
              onClick={copyAddress}
              aria-label="Copy full address"
            >
              <Copy className="w-4 h-4" />
              Copy Address
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
              onClick={() => { disconnect(); setDropdownOpen(false) }}
              aria-label="Disconnect wallet"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </motion.div>
      )}

      {dropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
      )}
    </div>
  )
}
