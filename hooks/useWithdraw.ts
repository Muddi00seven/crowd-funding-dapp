'use client'
import { useState } from 'react'
import { getCrowdFundingContract, getTxUrl } from '@/lib/contract'
import { useWeb3 } from '@/hooks/useWeb3'
import { toast } from 'sonner'

function isUserRejection(e: unknown): boolean {
  const code = (e as { code?: string | number })?.code
  if (code === 4001 || code === 'ACTION_REJECTED') return true
  const msg = ((e as { message?: string })?.message ?? '').toLowerCase()
  return msg.includes('rejected') || msg.includes('denied') || msg.includes('user rejected')
}

export type WithdrawStep = 'signing' | 'confirming' | null

export function useWithdraw() {
  const { getSigner, isConnected } = useWeb3()
  const [isPending, setIsPending] = useState(false)
  const [pendingStep, setPendingStep] = useState<WithdrawStep>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hash, setHash] = useState<string | undefined>()

  const withdraw = async (campaignId: bigint): Promise<boolean> => {
    if (!isConnected) return false
    setIsPending(true)
    setIsSuccess(false)

    try {
      const signer = await getSigner()
      const contract = getCrowdFundingContract(signer)

      // MetaMask open
      setPendingStep('signing')
      toast.loading('Withdrawing funds...', { id: 'withdraw', description: 'Confirm in MetaMask' })

      const tx = await contract.withdraw(campaignId)
      setHash(tx.hash)

      // Waiting for confirmation
      setPendingStep('confirming')
      toast.loading('Confirming withdrawal...', { id: 'withdraw', description: 'Waiting for blockchain...' })
      await tx.wait()

      setIsSuccess(true)
      toast.dismiss('withdraw')
      toast.success('Funds withdrawn!', {
        description: 'USDT has been transferred to your wallet',
        action: { label: 'View Tx', onClick: () => window.open(getTxUrl(tx.hash), '_blank') },
      })
      return true
    } catch (e: unknown) {
      console.error('[useWithdraw]', e)
      toast.dismiss('withdraw')
      if (isUserRejection(e)) toast.error('Transaction cancelled')
      else toast.error('Withdrawal failed', { description: (e as { message?: string })?.message })
      return false
    } finally {
      setIsPending(false)
      setPendingStep(null)
    }
  }

  return { withdraw, isPending, pendingStep, isSuccess, hash }
}
