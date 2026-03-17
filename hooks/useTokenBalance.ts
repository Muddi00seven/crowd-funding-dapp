'use client'
import { useState, useEffect, useCallback } from 'react'
import { getUsdtContract, USDT_TOKEN_ADDRESS, CONTRACT_ADDRESS, getReadProvider } from '@/lib/contract'
import { formatUsdt } from '@/lib/utils'
import { useWeb3 } from '@/hooks/useWeb3'

export function useTokenBalance() {
  const { address, isConnected } = useWeb3()
  const [balance, setBalance] = useState(0n)
  const [allowance, setAllowance] = useState(0n)
  const hasToken = !!USDT_TOKEN_ADDRESS

  const fetchBalances = useCallback(async () => {
    if (!isConnected || !address || !hasToken) return
    try {
      const provider = getReadProvider()
      const contract = getUsdtContract(provider)
      const [bal, allow] = await Promise.all([
        contract.balanceOf(address),
        contract.allowance(address, CONTRACT_ADDRESS),
      ])
      setBalance(bal as bigint)
      setAllowance(allow as bigint)
    } catch (e) {
      console.error('useTokenBalance:', e)
    }
  }, [address, isConnected, hasToken])

  useEffect(() => { fetchBalances() }, [fetchBalances])

  return {
    balance,
    allowance,
    formatted: hasToken ? formatUsdt(balance) : '—',
    refetch: fetchBalances,
  }
}
