'use client'
import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { TransactionRow } from './TransactionRow'
import { useTransactions } from '@/hooks/useTransactions'

interface TransactionHistoryProps {
  campaignId: bigint
  refreshKey?: number
}

export function TransactionHistory({ campaignId, refreshKey }: TransactionHistoryProps) {
  const { contributions, isLoading, isError, error, refetch } = useTransactions(campaignId)

  useEffect(() => {
    if (refreshKey && refreshKey > 0) refetch()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey])

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Contributions</h3>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Contributions</h3>
        <p className="text-sm text-destructive">{error?.message}</p>
      </div>
    )
  }

  if (!contributions || contributions.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Contributions</h3>
        <p className="text-sm text-muted-foreground">No contributions yet ✨</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Contributions</h3>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left py-3 px-2 text-muted-foreground font-medium">Contributor</th>
              <th className="text-left py-3 px-2 text-muted-foreground font-medium">Amount</th>
              <th className="text-left py-3 px-2 text-muted-foreground font-medium">Tx Hash</th>
              <th className="text-left py-3 px-2 text-muted-foreground font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {contributions.map((c, i) => (
                <TransactionRow key={`${c.txHash}-${i}`} contribution={c} />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  )
}
