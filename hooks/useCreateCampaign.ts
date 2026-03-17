'use client'
import { useState } from 'react'
import { parseUnits } from 'ethers'
import { getCrowdFundingContract, getTxUrl } from '@/lib/contract'
import { useWeb3 } from '@/hooks/useWeb3'
import { toast } from 'sonner'
import { useTransactionStore } from '@/store/transactionStore'
import type { CreateCampaignFormData } from '@/lib/validations'
import { getAuthorizedSigner } from '@/lib/authorizedSigner'

export function useCreateCampaign() {
  const { walletProvider, address, isConnected } = useWeb3()
  // const [loading, setLoading] = useState(false) // Local state removed
  const [isSuccess, setIsSuccess] = useState(false)
  const setPending = useTransactionStore((state) => state.setPending)
  const triggerRefresh = useTransactionStore((state) => state.triggerRefresh)

  const createCampaign = async (data: CreateCampaignFormData): Promise<boolean> => {
    try {
      if (!walletProvider || !address || !isConnected) return false

      setPending(true, 'Waiting for signature in wallet...')

      const { signer } = await getAuthorizedSigner(walletProvider, address)
      const contract = getCrowdFundingContract(signer)

      // MetaMask opens here — user signs the tx
      const tx = await contract.createCampaign(
        data.title,
        data.description,
        parseUnits(data.goalUsdt, 6),
        BigInt(data.durationDays),
      )

      setPending(true, 'Transaction processing on blockchain...', tx.hash)

      // wait for 1 block confirmation using the injected provider
      await tx.wait(1)

      setIsSuccess(true)
      setPending(false)
      triggerRefresh() // Tell all fetch hooks to update

      toast.success('Campaign created!', {
        description: 'Your campaign is now live on-chain',
        action: { label: 'View Tx', onClick: () => window.open(getTxUrl(tx.hash), '_blank') },
      })
      return true
    } catch (error: unknown) {
      console.log('[useCreateCampaign] error:', error)
      setPending(false) // Dismiss loading screen
      const code = (error as { code?: number | string })?.code
      if (code === 4001 || code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled')
      } else if (code === 4100) {
        toast.error('Wallet authorization lost. Reconnect MetaMask and try again.')
      }
      return false
    }
  }

  // We still return a 'loading' boolean mapped to isPending for backward compatibility in the button component
  const loading = useTransactionStore((state) => state.isPending)

  return { createCampaign, loading, isSuccess }
}
