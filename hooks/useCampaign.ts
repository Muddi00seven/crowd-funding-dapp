import { useReadContract } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/contract'
import { MOCK_CAMPAIGNS } from '@/lib/mockData'
import type { Campaign } from '@/types'

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

  return {
    campaign: useMock ? mockCampaign : (data as Campaign | undefined),
    isLoading: useMock ? false : isLoading,
    isError: useMock ? false : isError,
    error: useMock ? null : error,
    refetch,
  }
}
