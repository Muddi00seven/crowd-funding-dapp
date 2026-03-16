import { useReadContract } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/contract'
import { MOCK_CAMPAIGNS } from '@/lib/mockData'
import type { Campaign } from '@/types'

export function useCampaigns() {
  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getCampaignCount',
  })

  // Use mock data when contract not deployed
  const useMock = !CONTRACT_ADDRESS || CONTRACT_ADDRESS === ('' as `0x${string}`)

  return {
    campaigns: useMock ? MOCK_CAMPAIGNS : (data as Campaign[] | undefined),
    isLoading: useMock ? false : isLoading,
    isError: useMock ? false : isError,
    error: useMock ? null : error,
    refetch,
  }
}
