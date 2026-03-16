import { useReadContract } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/contract'
import { MOCK_CONTRIBUTIONS } from '@/lib/mockData'
import type { Contribution } from '@/types'

export function useTransactions(campaignId: bigint) {
  const useMock = !CONTRACT_ADDRESS || CONTRACT_ADDRESS === 'undefined'

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getContributions',
    args: [campaignId],
    query: { enabled: !useMock },
  })

  return {
    contributions: useMock ? MOCK_CONTRIBUTIONS : (data as Contribution[] | undefined),
    isLoading: useMock ? false : isLoading,
    isError: useMock ? false : isError,
    error: useMock ? null : error,
    refetch,
  }
}
