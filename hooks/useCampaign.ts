import { useReadContract } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/contract'
import { MOCK_CAMPAIGNS } from '@/lib/mockData'
import type { Campaign } from '@/types'

type CampaignTuple = readonly [bigint, `0x${string}`, string, string, bigint, bigint, bigint, boolean, bigint]

function parseCampaignTuple(raw: CampaignTuple): Campaign {
  return {
    id: raw[0],
    creator: raw[1],
    title: raw[2],
    description: raw[3],
    goal: raw[4],
    raised: raw[5],
    deadline: raw[6],
    withdrawn: raw[7],
    contributorsCount: raw[8],
  }
}

export function useCampaign(campaignId: bigint) {
  const useMock = !CONTRACT_ADDRESS || CONTRACT_ADDRESS === ('' as `0x${string}`)

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getCampaign',
    args: [campaignId],
    query: { enabled: !useMock },
  })

  const mockCampaign = MOCK_CAMPAIGNS.find((c) => c.id === campaignId)

  const campaign = useMock
    ? mockCampaign
    : data
    ? parseCampaignTuple(data as CampaignTuple)
    : undefined

  return {
    campaign,
    isLoading: useMock ? false : isLoading,
    isError: useMock ? false : isError,
    error: useMock ? null : error,
    refetch,
  }
}
