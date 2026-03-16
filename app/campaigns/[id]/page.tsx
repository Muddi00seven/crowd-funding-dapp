'use client'
import { use } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { CampaignDetail } from '@/components/campaigns/CampaignDetail'
import { PageWrapper } from '@/components/PageWrapper'
import { useCampaign } from '@/hooks/useCampaign'

interface CampaignPageProps {
  params: Promise<{ id: string }>
}

export default function CampaignPage({ params }: CampaignPageProps) {
  const { id } = use(params)
  const campaignId = BigInt(id)
  const { campaign, isLoading, isError, error } = useCampaign(campaignId)

  return (
    <>
      <Navbar />
      <PageWrapper>
        <main className="py-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            aria-label="Back to campaigns"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Campaigns
          </Link>

          <CampaignDetail
            campaign={campaign}
            isLoading={isLoading}
            isError={isError}
            error={error as Error | null}
          />
        </main>
      </PageWrapper>
    </>
  )
}
