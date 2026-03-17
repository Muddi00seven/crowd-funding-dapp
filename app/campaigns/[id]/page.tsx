'use client'
import { useState } from 'react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { CampaignDetail } from '@/components/campaigns/CampaignDetail'
import { PageWrapper } from '@/components/PageWrapper'
import { BlockchainLoadingScreen } from '@/components/transactions/BlockchainLoadingScreen'
import { Button } from '@/components/ui/button'
import { useCampaign } from '@/hooks/useCampaign'
import { useTransactionStore } from '@/store/transactionStore'

interface CampaignPageProps {
  params: { id: string }
}

export default function CampaignPage({ params }: CampaignPageProps) {
  const campaignId = BigInt(params.id)
  const { campaign, isLoading, isError, error, refetch } = useCampaign(campaignId)
  const triggerRefresh = useTransactionStore((state) => state.triggerRefresh)
  const [loadingLatest, setLoadingLatest] = useState(false)

  const handleLoadLatest = () => {
    setLoadingLatest(true)
    setTimeout(() => {
      setLoadingLatest(false)
      refetch()
      triggerRefresh()
    }, 24000)
  }

  return (
    <>
      <Navbar />
      <BlockchainLoadingScreen
        open={loadingLatest}
        title="Loading latest data..."
        description="Fetching latest campaign data from the blockchain"
      />
      <PageWrapper>
        <main className="py-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Back to campaigns"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Campaigns
            </Link>

            <Button
              variant="outline"
              size="sm"
              className="border-border text-muted-foreground hover:text-foreground gap-2"
              disabled={loadingLatest}
              onClick={handleLoadLatest}
              aria-label="Load latest campaign data"
            >
              <RefreshCw className="w-4 h-4" />
              Load Latest Data
            </Button>
          </div>

          <CampaignDetail
            campaign={campaign}
            isLoading={isLoading}
            isError={isError}
            error={error as Error | null}
            refetchCampaign={refetch}
          />
        </main>
      </PageWrapper>
    </>
  )
}
