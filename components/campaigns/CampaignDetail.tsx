'use client'
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Users, Clock, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from './ProgressBar'
import { CampaignSkeleton } from './CampaignSkeleton'
import { ContributeForm } from '@/components/contribute/ContributeForm'
import { WithdrawButton } from '@/components/withdraw/WithdrawButton'
import { TransactionHistory } from '@/components/transactions/TransactionHistory'
import { formatUsdt, getDaysLeft, truncateAddress } from '@/lib/utils'
import { getAddressUrl } from '@/lib/contract'
import type { Campaign } from '@/types'

interface CampaignDetailProps {
  campaign: Campaign | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetchCampaign: () => void
}

export function CampaignDetail({ campaign, isLoading, isError, error, refetchCampaign }: CampaignDetailProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = useCallback(() => {
    void Promise.resolve(refetchCampaign())
    setRefreshKey((k) => k + 1)

    // Some RPC endpoints can lag briefly after confirmation.
    setTimeout(() => {
      void Promise.resolve(refetchCampaign())
      setRefreshKey((k) => k + 1)
    }, 1200)
  }, [refetchCampaign])

  if (isLoading) return <CampaignSkeleton />

  if (isError) {
    return (
      <div className="text-center py-16 text-destructive">
        <p className="text-lg font-semibold">Failed to load campaign</p>
        <p className="text-sm text-muted-foreground mt-2">{error?.message}</p>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">Campaign not found</p>
      </div>
    )
  }

  const daysLeft = getDaysLeft(campaign.deadline)
  const isExpired = daysLeft === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-start gap-3 mb-3">
              <h1 className="text-3xl font-bold text-foreground">{campaign.title}</h1>
              {isExpired ? (
                <Badge variant="destructive">Expired</Badge>
              ) : daysLeft <= 3 ? (
                <Badge className="bg-warning text-black">Ending Soon</Badge>
              ) : (
                <Badge className="bg-primary/20 text-primary">Active</Badge>
              )}
            </div>
            <p className="text-muted-foreground leading-relaxed">{campaign.description}</p>
          </div>

          <ProgressBar raised={campaign.raised} goal={campaign.goal} />

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <Target className="w-5 h-5 mx-auto mb-1 text-accent" />
              <p className="text-sm text-muted-foreground">Goal</p>
              <p className="font-semibold">{formatUsdt(campaign.goal)} USDT</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-accent" />
              <p className="text-sm text-muted-foreground">Contributors</p>
              <p className="font-semibold">{Number(campaign.contributorsCount)}</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-accent" />
              <p className="text-sm text-muted-foreground">Days Left</p>
              <p className="font-semibold">{isExpired ? 'Expired' : `${daysLeft}d`}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Created by:</span>
            <a
              href={getAddressUrl(campaign.creator)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-accent hover:underline flex items-center gap-1"
            >
              {truncateAddress(campaign.creator, 6, 4)}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <TransactionHistory campaignId={campaign.id} refreshKey={refreshKey} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <ContributeForm campaignId={campaign.id} isExpired={isExpired} onSuccess={handleSuccess} />
          <WithdrawButton campaign={campaign} onSuccess={handleSuccess} />
        </div>
      </div>
    </motion.div>
  )
}
