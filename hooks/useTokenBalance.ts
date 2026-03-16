'use client'
import { useState, useEffect, useCallback } from 'react'
import { BrowserProvider } from 'ethers'
import type { Eip1193Provider } from 'ethers'
import { useAppKitProvider } from '@reown/appkit/react'
import { getUsdtContract, USDT_TOKEN_ADDRESS, CONTRACT_ADDRESS } from '@/lib/contract'
import { formatUsdt } from '@/lib/utils'
import { useWeb3 } from '@/hooks/useWeb3'

export function useTokenBalance() {
  const { address, isConnected } = useWeb3()
  const { walletProvider } = useAppKitProvider<Eip1193Provider>('eip155')
  const [balance, setBalance] = useState(0n)
  const [allowance, setAllowance] = useState(0n)
  const hasToken = !!USDT_TOKEN_ADDRESS

  const fetchBalances = useCallback(async () => {
    if (!isConnected || !address || !hasToken || !walletProvider) return
    try {
      const provider = new BrowserProvider(walletProvider)
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
  }, [address, isConnected, hasToken, walletProvider])

  useEffect(() => { fetchBalances() }, [fetchBalances])

  return {
    balance,
    allowance,
    formatted: hasToken ? formatUsdt(balance) : '—',
    refetch: fetchBalances,
  }
}
