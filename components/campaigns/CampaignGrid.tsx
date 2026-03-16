'use client'
import { motion } from 'framer-motion'
import { CampaignCard } from './CampaignCard'
import { CampaignSkeleton } from './CampaignSkeleton'
import { useCampaigns } from '@/hooks/useCampaigns'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

export function CampaignGrid() {
  const { campaigns, isLoading, isError, error } = useCampaigns()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CampaignSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-16 text-destructive">
        <p className="text-lg font-semibold">Something went wrong</p>
        <p className="text-sm text-muted-foreground mt-2">{error?.message}</p>
      </div>
    )
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">No campaigns yet</p>
        <p className="text-sm mt-2">Be the first to create one!</p>
      </div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {campaigns.map((campaign) => (
        <motion.div key={campaign.id.toString()} variants={cardVariants}>
          <CampaignCard campaign={campaign} />
        </motion.div>
      ))}
    </motion.div>
  )
}
