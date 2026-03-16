'use client'
import { useAccount, useChainId } from 'wagmi'
import { Badge } from '@/components/ui/badge'
import { truncateAddress } from '@/lib/utils'
import { SUPPORTED_CHAIN_ID } from '@/lib/contract'

export function WalletStatus() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  if (!isConnected || !address) return null

  const isCorrectNetwork = chainId === SUPPORTED_CHAIN_ID
  const networkName = chainId === 1 ? 'Mainnet' : chainId === 11155111 ? 'Sepolia' : `Chain ${chainId}`

  return (
    <div className="flex items-center gap-2">
      {isCorrectNetwork ? (
        <Badge className="bg-success/20 text-success border-success/30">
          {networkName}
        </Badge>
      ) : (
        <Badge variant="destructive">Wrong Network</Badge>
      )}
      <span className="font-mono text-sm text-muted-foreground">
        {truncateAddress(address, 4, 4)}
      </span>
    </div>
  )
}
