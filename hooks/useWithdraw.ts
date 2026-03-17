'use client'
import { useState } from 'react'
import { getCrowdFundingContract, getTxUrl } from '@/lib/contract'
import { useWeb3 } from '@/hooks/useWeb3'
import { toast } from 'sonner'

import { useTransactionStore } from '@/store/transactionStore'
import { getAuthorizedSigner } from '@/lib/authorizedSigner'

export function useWithdraw() {
  const { walletProvider, address, isConnected } = useWeb3()
  // const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const setPending = useTransactionStore((state) => state.setPending)
  const triggerRefresh = useTransactionStore((state) => state.triggerRefresh)

  const withdraw = async (campaignId: bigint): Promise<boolean> => {
    try {
      if (!walletProvider || !address || !isConnected) return false

      setPending(true, 'Waiting for signature in wallet...')

      const { signer } = await getAuthorizedSigner(walletProvider, address)
      const contract = getCrowdFundingContract(signer)

      // MetaMask opens here — user signs the tx
      const tx = await contract.withdraw(campaignId)

      setPending(true, 'Processing withdrawal on blockchain...', tx.hash)

      // wait for 1 block confirmation using the injected provider
      await tx.wait(1)

      setIsSuccess(true)
      setPending(false)
      triggerRefresh()

      toast.success('Funds withdrawn!', {
        description: 'USDT has been transferred to your wallet',
        action: { label: 'View Tx', onClick: () => window.open(getTxUrl(tx.hash), '_blank') },
      })
      return true
    } catch (error: unknown) {
      console.log('[useWithdraw] error:', error)
      setPending(false)
      const code = (error as { code?: number | string })?.code
      if (code === 4001 || code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled')
      } else if (code === 4100) {
        toast.error('Wallet authorization lost. Reconnect MetaMask and try again.')
      }
      return false
    }
  }

  const loading = useTransactionStore((state) => state.isPending)

  return { withdraw, loading, isSuccess }
}
