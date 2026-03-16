'use client'
import { useState } from 'react'
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

export type CreateStep = 'signing' | 'confirming' | null

export function useCreateCampaign() {
  const { getSigner, isConnected } = useWeb3()
  const [isPending, setIsPending] = useState(false)
  const [pendingStep, setPendingStep] = useState<CreateStep>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hash, setHash] = useState<string | undefined>()

  const createCampaign = async (data: CreateCampaignFormData): Promise<boolean> => {
    if (!isConnected) return false
    setIsPending(true)
    setIsSuccess(false)

    try {
      const signer = await getSigner()
      const contract = getCrowdFundingContract(signer)

      // MetaMask open
      setPendingStep('signing')
      toast.loading('Creating campaign...', { id: 'create', description: 'Confirm in MetaMask' })

      const tx = await contract.createCampaign(
        data.title,
        data.description,
        parseUnits(data.goalUsdt, 6),
        BigInt(data.durationDays),
      )
      setHash(tx.hash)

      // Waiting for confirmation
      setPendingStep('confirming')
      toast.loading('Confirming campaign...', { id: 'create', description: 'Waiting for blockchain...' })
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
      else toast.error('Failed to create campaign', { description: (e as { message?: string })?.message })
      return false
    } finally {
      setIsPending(false)
      setPendingStep(null)
    }
  }

  return { createCampaign, isPending, pendingStep, isSuccess, hash }
}
