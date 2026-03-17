'use client'
import { useState, useEffect, useCallback } from 'react'
import { getReadProvider, getCrowdFundingContract, CONTRACT_ADDRESS } from '@/lib/contract'
import { MOCK_CAMPAIGNS } from '@/lib/mockData'
import type { Campaign } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseCampaign(r: any): Campaign {
  return {
    id: r[0] as bigint,
    creator: r[1] as string,
    title: r[2] as string,
    description: r[3] as string,
    goal: r[4] as bigint,
    raised: r[5] as bigint,
    deadline: r[6] as bigint,
    withdrawn: r[7] as boolean,
    contributorsCount: r[8] as bigint,
  }
}

export function useCampaign(campaignId: bigint) {
  const useMock = !CONTRACT_ADDRESS
  const [campaign, setCampaign] = useState<Campaign | undefined>(
    useMock ? MOCK_CAMPAIGNS.find((c) => c.id === campaignId) : undefined
  )
  const [isLoading, setIsLoading] = useState(!useMock)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchCampaign = useCallback(async () => {
    if (useMock) return
    setIsLoading(true)
    setIsError(false)
    try {
      const provider = getReadProvider()
      const contract = getCrowdFundingContract(provider)
      const result = await contract.getCampaign(campaignId)
      setCampaign(parseCampaign(result))
    } catch (e) {
      setIsError(true)
      setError(e as Error)
    } finally {
      setIsLoading(false)
    }
  }, [useMock, campaignId])

  useEffect(() => { fetchCampaign() }, [fetchCampaign])

  return { campaign, isLoading, isError, error, refetch: fetchCampaign }
}
