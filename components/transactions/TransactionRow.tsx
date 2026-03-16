'use client'
import { motion } from 'framer-motion'
import { Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { truncateAddress, formatEth, timeAgo } from '@/lib/utils'
import { getTxUrl, getAddressUrl } from '@/lib/contract'
import type { Contribution } from '@/types'

interface TransactionRowProps {
  contribution: Contribution
}

export function TransactionRow({ contribution }: TransactionRowProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="border-b border-border"
    >
      <td className="py-3 px-2">
        <a
          href={getAddressUrl(contribution.contributor)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm text-accent hover:underline flex items-center gap-1"
          aria-label={`View contributor address on explorer`}
        >
          {truncateAddress(contribution.contributor, 4, 4)}
          <ExternalLink className="w-3 h-3" />
        </a>
      </td>
      <td className="py-3 px-2 text-sm font-medium text-foreground">
        {formatEth(contribution.amount, 4)} ETH
      </td>
      <td className="py-3 px-2">
        <div className="flex items-center gap-1">
          <a
            href={getTxUrl(contribution.txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs text-accent hover:underline"
            aria-label="View transaction on explorer"
          >
            {truncateAddress(contribution.txHash, 6, 4)}
          </a>
          <button
            onClick={() => copyToClipboard(contribution.txHash, 'Tx hash')}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Copy transaction hash"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </td>
      <td className="py-3 px-2 text-sm text-muted-foreground">
        {timeAgo(contribution.timestamp)}
      </td>
    </motion.tr>
  )
}
