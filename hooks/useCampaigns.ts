import { useReadContract, useReadContracts } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/contract'
import { MOCK_CAMPAIGNS } from '@/lib/mockData'
import type { Campaign } from '@/types'

// Parse the tuple returned by getCampaign into a Campaign object
function parseCampaignTuple(
  raw: readonly [bigint, `0x${string}`, string, string, bigint, bigint, bigint, boolean, bigint]
): Campaign {
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

export function useCampaigns() {
  const useMock = !CONTRACT_ADDRESS || CONTRACT_ADDRESS === ('' as `0x${string}`)

  // Step 1: get total campaign count
  const { data: countData, isLoading: countLoading, isError: countError, error: countErr } =
    useReadContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getCampaignCount',
      query: { enabled: !useMock },
    })

  const count = typeof countData === 'bigint' ? Number(countData) : 0

  // Step 2: batch-fetch all campaigns by ID
  const { data: campaignsData, isLoading: campaignsLoading, isError: campaignsError, refetch } =
    useReadContracts({
      contracts: Array.from({ length: count }, (_, i) => ({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getCampaign' as const,
        args: [BigInt(i)] as const,
      })),
      query: { enabled: !useMock && count > 0 },
    })

  const campaigns: Campaign[] = (campaignsData ?? [])
    .filter((r) => r.status === 'success' && r.result)
    .map((r) =>
      parseCampaignTuple(
        r.result as readonly [bigint, `0x${string}`, string, string, bigint, bigint, bigint, boolean, bigint]
      )
    )

  return {
    campaigns: useMock ? MOCK_CAMPAIGNS : campaigns,
    isLoading: useMock ? false : countLoading || campaignsLoading,
    isError: useMock ? false : countError || campaignsError,
    error: useMock ? null : countErr,
    refetch,
  }
}
