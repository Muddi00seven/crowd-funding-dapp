'use client'
import { useState } from 'react'
import { BrowserProvider, parseUnits } from 'ethers'
import { getCrowdFundingContract, getTxUrl, pollForReceipt } from '@/lib/contract'
import { useWeb3 } from '@/hooks/useWeb3'
import { toast } from 'sonner'
import type { CreateCampaignFormData } from '@/lib/validations'

export function useCreateCampaign() {
  const { walletProvider, address, isConnected } = useWeb3()
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const createCampaign = async (data: CreateCampaignFormData): Promise<boolean> => {
    try {
      if (!walletProvider || !address || !isConnected) return false
      setLoading(true)

      const provider = new BrowserProvider(walletProvider)
      const signer = await provider.getSigner()
      const contract = getCrowdFundingContract(signer)

      // MetaMask opens here — user signs the tx
      const tx = await contract.createCampaign(
        data.title,
        data.description,
        parseUnits(data.goalUsdt, 6),
        BigInt(data.durationDays),
      )

      // tx.hash is available — now poll public RPC until mined
      // (wallet provider resolves tx.wait() immediately — unreliable)
      await pollForReceipt(tx.hash)

      setIsSuccess(true)
      setLoading(false)
      toast.success('Campaign created!', {
        description: 'Your campaign is now live on-chain',
        action: { label: 'View Tx', onClick: () => window.open(getTxUrl(tx.hash), '_blank') },
      })
      return true
    } catch (error: unknown) {
      console.log('[useCreateCampaign] error:', error)
      setLoading(false)
      const code = (error as { code?: number | string })?.code
      if (code === 4001 || code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled')
      }
      return false
    }
  }

  return { createCampaign, loading, isSuccess }
}
