'use client'
import { useWeb3 } from '@/hooks/useWeb3'
import { Badge } from '@/components/ui/badge'
import { truncateAddress } from '@/lib/utils'

export function WalletStatus() {
  const { address, isConnected, chainId, isCorrectNetwork } = useWeb3()

  if (!isConnected || !address) return null

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
