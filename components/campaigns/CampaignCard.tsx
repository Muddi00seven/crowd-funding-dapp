'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Clock, Users, ArrowRight, CheckCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  const goalReached = campaign.raised >= campaign.goal

  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-6 space-y-4 hover:border-primary/50 transition-colors flex flex-col"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <Link href={`/campaigns/${campaign.id}`} className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-card-foreground line-clamp-2 hover:text-primary transition-colors">
            {campaign.title}
          </h3>
        </Link>
        {campaign.withdrawn ? (
          <Badge className="shrink-0 bg-muted text-muted-foreground">Withdrawn</Badge>
        ) : goalReached ? (
          <Badge className="shrink-0 bg-success/20 text-success border-success/30 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Funded
          </Badge>
        ) : isExpired ? (
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

      {/* CTA */}
      <div className="pt-1">
        <Button
          asChild
          className="w-full bg-primary hover:bg-primary/90 gap-2"
          disabled={isExpired && !goalReached}
        >
          <Link href={`/campaigns/${campaign.id}`}>
            {isExpired ? 'View Campaign' : 'Contribute'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </motion.div>
  )
}
