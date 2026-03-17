'use client'
import { useState, useEffect, useCallback } from 'react'
import { getReadProvider, getCrowdFundingContract, CONTRACT_ADDRESS } from '@/lib/contract'
import { MOCK_CAMPAIGNS } from '@/lib/mockData'
import type { Campaign } from '@/types'
import { useTransactionStore } from '@/store/transactionStore'

function parseCampaign(r: Record<number, unknown>): Campaign {
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

export function useCampaigns() {
  const useMock = !CONTRACT_ADDRESS
  const [campaigns, setCampaigns] = useState<Campaign[]>(useMock ? MOCK_CAMPAIGNS : [])
  const [isLoading, setIsLoading] = useState(!useMock)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchCampaigns = useCallback(async () => {
    if (useMock) return
    setIsLoading(true)
    setIsError(false)
    try {
      const provider = getReadProvider()
      const contract = getCrowdFundingContract(provider)
      const count = Number(await contract.getCampaignCount())
      if (count === 0) { setCampaigns([]); return }
      const results = await Promise.all(
        Array.from({ length: count }, (_, i) => contract.getCampaign(i))
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setCampaigns(results.map((r: any) => parseCampaign(r)))
    } catch (e) {
      console.error('useCampaigns:', e)
      setIsError(true)
      setError(e as Error)
    } finally {
      setIsLoading(false)
    }
  }, [useMock])

  const refreshTrigger = useTransactionStore((state) => state.refreshTrigger)

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns, refreshTrigger])

  return { campaigns, isLoading, isError, error, refetch: fetchCampaigns }
}
