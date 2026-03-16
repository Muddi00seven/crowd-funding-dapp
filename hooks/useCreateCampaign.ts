'use client'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits } from 'viem'
import { CONTRACT_ABI, CONTRACT_ADDRESS, getTxUrl } from '@/lib/contract'
import { toast } from 'sonner'
import type { CreateCampaignFormData } from '@/lib/validations'

export function useCreateCampaign() {
  const { writeContract, data: hash, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const createCampaign = async (data: CreateCampaignFormData) => {
    try {
      toast.loading("Creating campaign...", {
        id: 'create-campaign',
        description: "Confirm the transaction in MetaMask",
      })

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'createCampaign',
        args: [
          data.title,
          data.description,
          parseUnits(data.goalUsdt, 6),
          BigInt(data.durationDays),
        ],
      })
    } catch (error) {
      toast.dismiss('create-campaign')
      if (error instanceof Error) {
        if (error.message.includes('rejected') || error.message.includes('denied')) {
          toast.error("Transaction cancelled")
          return
        }
        toast.error("Failed to create campaign", { description: error.message })
      }
    }
  }

  if (isSuccess && hash) {
    toast.dismiss('create-campaign')
    toast.success("Campaign created!", {
      description: "Your campaign is now live on-chain",
      action: { label: "View Tx", onClick: () => window.open(getTxUrl(hash), '_blank') },
    })
  }

  return {
    createCampaign,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  }
}
