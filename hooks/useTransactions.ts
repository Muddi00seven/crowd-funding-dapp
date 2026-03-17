'use client'
import { useState, useEffect, useCallback } from 'react'
import { getReadProvider, getCrowdFundingContract, CONTRACT_ADDRESS } from '@/lib/contract'
import type { Contribution } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseContribution(r: any): Contribution {
  return {
    contributor: r[0] as string,
    amount: r[1] as bigint,
    txHash: r[2] as string,
    timestamp: r[3] as bigint,
  }
}

export function useTransactions(campaignId: bigint) {
  const useMock = !CONTRACT_ADDRESS
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [isLoading, setIsLoading] = useState(!useMock)
  const [isError, setIsError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchContributions = useCallback(async () => {
    if (useMock) { setIsLoading(false); return }
    setIsLoading(true)
    setIsError(false)
    try {
      const provider = getReadProvider()
      const contract = getCrowdFundingContract(provider)
      const results = await contract.getContributions(campaignId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setContributions((results as any[]).map(parseContribution))
    } catch (e) {
      console.error('useTransactions:', e)
      setIsError(true)
      setError(e as Error)
    } finally {
      setIsLoading(false)
    }
  }, [useMock, campaignId])

  useEffect(() => { fetchContributions() }, [fetchContributions])

  return { contributions, isLoading, isError, error, refetch: fetchContributions }
}
