'use client'
import { Badge } from '@/components/ui/badge'
import { CONTRACT_ADDRESS, getAddressUrl } from '@/lib/contract'
import { ExternalLink } from 'lucide-react'
import { truncateAddress } from '@/lib/utils'

export function ContractStatus() {
  const isDeployed = CONTRACT_ADDRESS && CONTRACT_ADDRESS !== ('' as `0x${string}`)

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {isDeployed ? (
        <>
          <Badge className="bg-success/20 text-success border-success/30 text-xs">Contract Live</Badge>
          <a
            href={getAddressUrl(CONTRACT_ADDRESS)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono hover:text-accent flex items-center gap-0.5"
            aria-label="View contract on explorer"
          >
            {truncateAddress(CONTRACT_ADDRESS, 4, 4)}
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </>
      ) : (
        <Badge variant="outline" className="text-xs text-muted-foreground">Mock Data</Badge>
      )}
    </div>
  )
}
