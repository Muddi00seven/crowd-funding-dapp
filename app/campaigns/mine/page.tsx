'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useWeb3 } from '@/hooks/useWeb3'
import { PlusCircle, ArrowRight, Clock, CheckCircle, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/Navbar'
import { PageWrapper } from '@/components/PageWrapper'
import { CampaignSkeleton } from '@/components/campaigns/CampaignSkeleton'
import { ProgressBar } from '@/components/campaigns/ProgressBar'
import { useCampaigns } from '@/hooks/useCampaigns'
import { formatUsdt, getDaysLeft, truncateAddress } from '@/lib/utils'

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.07, ease: 'easeOut' as const },
  }),
}

export default function MyCampaignsPage() {
  const { address, isConnected } = useWeb3()
  const { campaigns, isLoading } = useCampaigns()

  const myCampaigns = campaigns.filter(
    (c) => c.creator.toLowerCase() === (address ?? '').toLowerCase()
  )

  return (
    <>
      <Navbar />
      <PageWrapper>
        <main className="py-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-bold">My Campaigns</h1>
              {address && (
                <p className="text-sm text-muted-foreground font-mono mt-1">
                  {truncateAddress(address, 6, 4)}
                </p>
              )}
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
              <Link href="/campaigns/create">
                <PlusCircle className="w-4 h-4" />
                New Campaign
              </Link>
            </Button>
          </div>

          {!isConnected ? (
            <div className="text-center py-20 text-muted-foreground space-y-3">
              <p className="text-lg">Connect your wallet to see your campaigns</p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, i) => <CampaignSkeleton key={i} />)}
            </div>
          ) : myCampaigns.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <p className="text-lg text-muted-foreground">You have not created any campaigns yet</p>
              <Button asChild className="bg-primary hover:bg-primary/90 gap-2">
                <Link href="/campaigns/create">
                  <PlusCircle className="w-4 h-4" />
                  Create Your First Campaign
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myCampaigns.map((campaign, i) => {
                const daysLeft = getDaysLeft(campaign.deadline)
                const isExpired = daysLeft === 0
                const goalReached = campaign.raised >= campaign.goal
                const canWithdraw = goalReached && !campaign.withdrawn

                return (
                  <motion.div
                    key={campaign.id.toString()}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-xl border border-border bg-card p-6 space-y-4"
                  >
                    {/* Title + status */}
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg line-clamp-1">{campaign.title}</h3>
                      {campaign.withdrawn ? (
                        <Badge className="shrink-0 bg-muted text-muted-foreground">Withdrawn</Badge>
                      ) : goalReached ? (
                        <Badge className="shrink-0 bg-success/20 text-success border-success/30 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Funded
                        </Badge>
                      ) : isExpired ? (
                        <Badge variant="destructive" className="shrink-0">Expired</Badge>
                      ) : (
                        <Badge className="shrink-0 bg-primary/20 text-primary">Active</Badge>
                      )}
                    </div>

                    <ProgressBar raised={campaign.raised} goal={campaign.goal} animated={false} />

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 text-center text-sm">
                      <div className="bg-muted rounded-lg p-2">
                        <p className="text-muted-foreground text-xs">Raised</p>
                        <p className="font-semibold">{formatUsdt(campaign.raised)}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-2">
                        <p className="text-muted-foreground text-xs">Goal</p>
                        <p className="font-semibold">{formatUsdt(campaign.goal)}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-2">
                        <Clock className="w-3 h-3 mx-auto mb-0.5 text-muted-foreground" />
                        <p className="font-semibold">{isExpired ? 'Ended' : `${daysLeft}d`}</p>
                      </div>
                    </div>

                    {/* Contributors */}
                    <p className="text-xs text-muted-foreground">
                      {Number(campaign.contributorsCount)} contributor{Number(campaign.contributorsCount) !== 1 ? 's' : ''}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <Button asChild variant="outline" className="flex-1 border-border gap-1">
                        <Link href={`/campaigns/${campaign.id}`}>
                          View Details
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                      {canWithdraw && (
                        <Button asChild className="flex-1 bg-success hover:bg-success/90 text-white gap-1">
                          <Link href={`/campaigns/${campaign.id}`}>
                            <DollarSign className="w-3.5 h-3.5" />
                            Withdraw
                          </Link>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </main>
      </PageWrapper>
    </>
  )
}
