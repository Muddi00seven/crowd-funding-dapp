'use client'
import { useRef, useState } from 'react'
import { parseUnits } from 'ethers'
import { getCrowdFundingContract, getTxUrl } from '@/lib/contract'
import { useWeb3 } from '@/hooks/useWeb3'
import { toast } from 'sonner'
import type { CreateCampaignFormData } from '@/lib/validations'

function isUserRejection(e: unknown): boolean {
  const code = (e as { code?: string | number })?.code
  if (code === 4001 || code === 'ACTION_REJECTED') return true
  const msg = ((e as { message?: string })?.message ?? '').toLowerCase()
  return msg.includes('rejected') || msg.includes('denied') || msg.includes('user rejected')
}

export type CreateStep =
  | 'idle'
  | 'signing'     // MetaMask open — user must confirm create tx
  | 'confirming'  // tx submitted, waiting for on-chain confirmation

export function useCreateCampaign() {
  const { getSigner, isConnected } = useWeb3()
  const inFlightRef = useRef(false)
  const [step, setStep] = useState<CreateStep>('idle')
  const [isSuccess, setIsSuccess] = useState(false)

  const isPending = step !== 'idle'
  const isBlockchainConfirming = step === 'confirming'

  const createCampaign = async (data: CreateCampaignFormData): Promise<boolean> => {
    if (inFlightRef.current || !isConnected) return false
    inFlightRef.current = true

    try {
      const signer = await getSigner()
      const contract = getCrowdFundingContract(signer)

      // ── MetaMask open ──
      setStep('signing')
      toast.loading('Create campaign', {
        id: 'create',
        description: 'Confirm the transaction in MetaMask',
      })

      const tx = await contract.createCampaign(
        data.title,
        data.description,
        parseUnits(data.goalUsdt, 6),
        BigInt(data.durationDays),
      )

      // ── Tx submitted — waiting for blockchain ──
      setStep('confirming')
      toast.loading('Confirming campaign...', {
        id: 'create',
        description: 'Waiting for on-chain confirmation',
      })
      await tx.wait()

      setIsSuccess(true)
      toast.dismiss('create')
      toast.success('Campaign created!', {
        description: 'Your campaign is now live on-chain',
        action: { label: 'View Tx', onClick: () => window.open(getTxUrl(tx.hash), '_blank') },
      })
      return true
    } catch (e: unknown) {
      console.error('[useCreateCampaign]', e)
      toast.dismiss('create')
      if (isUserRejection(e)) toast.error('Transaction cancelled')
      return false
    } finally {
      setStep('idle')
      inFlightRef.current = false
    }
  }

  return { createCampaign, step, isPending, isBlockchainConfirming, isSuccess }
}
