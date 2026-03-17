'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CampaignCard } from './CampaignCard'
import { CampaignSkeleton } from './CampaignSkeleton'
import { useCampaigns } from '@/hooks/useCampaigns'
import type { Campaign } from '@/types'

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

type Tab = 'all' | 'active' | 'funded'

const TABS: { id: Tab; label: string }[] = [
  { id: 'all',    label: 'All Campaigns' },
  { id: 'active', label: 'Still Going'   },
  { id: 'funded', label: 'Goal Reached'  },
]

function filterCampaigns(campaigns: Campaign[], tab: Tab): Campaign[] {
  const now = BigInt(Math.floor(Date.now() / 1000))
  switch (tab) {
    case 'active': return campaigns.filter((c) => !c.withdrawn && c.raised < c.goal && c.deadline > now)
    case 'funded': return campaigns.filter((c) => c.raised >= c.goal)
    default:       return campaigns
  }
}

export function CampaignGrid() {
  const { campaigns, isLoading, isError, error } = useCampaigns()
  const [activeTab, setActiveTab] = useState<Tab>('all')

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

  const filtered = filterCampaigns(campaigns, activeTab)

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 bg-card rounded-lg shadow-sm"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
            {/* count badge */}
            <span className={`relative z-10 ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-primary/20 text-primary' : 'bg-border text-muted-foreground'
            }`}>
              {filterCampaigns(campaigns, tab.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16 text-muted-foreground"
          >
            <p className="text-lg">No campaigns in this category</p>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
          >
            {filtered.map((campaign) => (
              <motion.div key={campaign.id.toString()} variants={cardVariants} className="h-full">
                <CampaignCard campaign={campaign} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
