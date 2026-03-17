'use client'
import { useRef, useState } from 'react'
import { getCrowdFundingContract, getTxUrl } from '@/lib/contract'
import { useWeb3 } from '@/hooks/useWeb3'
import { toast } from 'sonner'

function isUserRejection(e: unknown): boolean {
  const code = (e as { code?: string | number })?.code
  if (code === 4001 || code === 'ACTION_REJECTED') return true
  const msg = ((e as { message?: string })?.message ?? '').toLowerCase()
  return msg.includes('rejected') || msg.includes('denied') || msg.includes('user rejected')
}

export type WithdrawStep =
  | 'idle'
  | 'signing'     // MetaMask open — user must confirm withdraw tx
  | 'confirming'  // tx submitted, waiting for on-chain confirmation

export function useWithdraw() {
  const { getSigner, isConnected } = useWeb3()
  const inFlightRef = useRef(false)
  const [step, setStep] = useState<WithdrawStep>('idle')
  const [isSuccess, setIsSuccess] = useState(false)

  const isPending = step !== 'idle'
  const isBlockchainConfirming = step === 'confirming'

  const withdraw = async (campaignId: bigint): Promise<boolean> => {
    if (inFlightRef.current || !isConnected) return false
    inFlightRef.current = true

    try {
      const signer = await getSigner()
      const contract = getCrowdFundingContract(signer)

      // ── MetaMask open ──
      setStep('signing')
      toast.loading('Withdraw funds', {
        id: 'withdraw',
        description: 'Confirm the transaction in MetaMask',
      })

      const tx = await contract.withdraw(campaignId)

      // ── Tx submitted — waiting for blockchain ──
      setStep('confirming')
      toast.loading('Confirming withdrawal...', {
        id: 'withdraw',
        description: 'Waiting for on-chain confirmation',
      })
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
      return false
    } finally {
      setStep('idle')
      inFlightRef.current = false
    }
  }

  return { withdraw, step, isPending, isBlockchainConfirming, isSuccess }
}
