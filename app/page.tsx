import { Navbar } from '@/components/Navbar'
import { CampaignGrid } from '@/components/campaigns/CampaignGrid'
import { PageWrapper } from '@/components/PageWrapper'

export default function Home() {
  return (
    <>
      <Navbar />
      <PageWrapper>
        <main className="py-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
          <div className="mb-12 text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Decentralized Crowdfunding
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Fund projects directly on the blockchain. No middlemen, full transparency, smart contract powered.
            </p>
          </div>

          <CampaignGrid />
        </main>
      </PageWrapper>
    </>
  )
}
