'use client'
import { useState } from 'react'
import { BrowserProvider } from 'ethers'
import { getCrowdFundingContract, getTxUrl, pollForReceipt } from '@/lib/contract'
import { useWeb3 } from '@/hooks/useWeb3'
import { toast } from 'sonner'

export function useWithdraw() {
  const { walletProvider, address, isConnected } = useWeb3()
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const withdraw = async (campaignId: bigint): Promise<boolean> => {
    try {
      if (!walletProvider || !address || !isConnected) return false
      setLoading(true)

      const provider = new BrowserProvider(walletProvider)
      const signer = await provider.getSigner()
      const contract = getCrowdFundingContract(signer)

      // MetaMask opens here — user signs the tx
      const tx = await contract.withdraw(campaignId)

      // tx.hash is available — now poll public RPC until mined
      await pollForReceipt(tx.hash)

      setIsSuccess(true)
      setLoading(false)
      toast.success('Funds withdrawn!', {
        description: 'USDT has been transferred to your wallet',
        action: { label: 'View Tx', onClick: () => window.open(getTxUrl(tx.hash), '_blank') },
      })
      return true
    } catch (error: unknown) {
      console.log('[useWithdraw] error:', error)
      setLoading(false)
      const code = (error as { code?: number | string })?.code
      if (code === 4001 || code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled')
      }
      return false
    }
  }

  return { withdraw, loading, isSuccess }
}
