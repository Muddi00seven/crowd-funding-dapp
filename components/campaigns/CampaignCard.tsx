'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from './ProgressBar'
import { CampaignSkeleton } from './CampaignSkeleton'
import { getDaysLeft, truncateAddress } from '@/lib/utils'
import type { Campaign } from '@/types'

interface CampaignCardProps {
  campaign: Campaign
  isLoading?: boolean
}

export function CampaignCard({ campaign, isLoading = false }: CampaignCardProps) {
  if (isLoading) return <CampaignSkeleton />

  const daysLeft = getDaysLeft(campaign.deadline)
  const isExpired = daysLeft === 0

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <motion.div
        className="rounded-xl border border-border bg-card p-6 space-y-4 cursor-pointer hover:border-primary/50 transition-colors"
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg text-card-foreground line-clamp-2">{campaign.title}</h3>
          {isExpired ? (
            <Badge variant="destructive" className="shrink-0">Expired</Badge>
          ) : daysLeft <= 3 ? (
            <Badge className="shrink-0 bg-warning text-black">Ending Soon</Badge>
          ) : null}
        </div>

        <p className="text-muted-foreground text-sm line-clamp-2">{campaign.description}</p>

        <ProgressBar raised={campaign.raised} goal={campaign.goal} />

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{Number(campaign.contributorsCount)} contributors</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{isExpired ? 'Expired' : `${daysLeft}d left`}</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          By {truncateAddress(campaign.creator, 4, 4)}
        </div>
      </motion.div>
    </Link>
  )
}
