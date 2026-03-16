import { Navbar } from '@/components/Navbar'
import { CreateCampaignForm } from '@/components/campaigns/CreateCampaignForm'
import { PageWrapper } from '@/components/PageWrapper'

export default function CreateCampaignPage() {
  return (
    <>
      <Navbar />
      <PageWrapper>
        <main className="py-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
          <div className="mb-10 text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold">Create a Campaign</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Launch a transparent, on-chain crowdfunding campaign. Funds are held in a smart contract and only released when your goal is met.
            </p>
          </div>

          <CreateCampaignForm />
        </main>
      </PageWrapper>
    </>
  )
}
