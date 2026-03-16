'use client'
import { useState } from 'react'
import { useWriteContract, useConfig } from 'wagmi'
import { parseUnits } from 'viem'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { CONTRACT_ABI, CONTRACT_ADDRESS, getTxUrl } from '@/lib/contract'
import { toast } from 'sonner'
import type { CreateCampaignFormData } from '@/lib/validations'

export function useCreateCampaign() {
  const config = useConfig()
  const { writeContractAsync } = useWriteContract()
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hash, setHash] = useState<`0x${string}` | undefined>()

  const createCampaign = async (data: CreateCampaignFormData) => {
    setIsPending(true)
    setIsSuccess(false)

    try {
      toast.loading("Creating campaign...", {
        id: 'create-campaign',
        description: "Confirm the transaction in MetaMask",
      })

      const txHash = await writeContractAsync({
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

      toast.loading("Waiting for confirmation...", {
        id: 'create-campaign',
        description: "Transaction submitted, mining...",
      })

      await waitForTransactionReceipt(config, { hash: txHash })

      setHash(txHash)
      setIsSuccess(true)
      toast.dismiss('create-campaign')
      toast.success("Campaign created!", {
        description: "Your campaign is now live on-chain",
        action: { label: "View Tx", onClick: () => window.open(getTxUrl(txHash), '_blank') },
      })
    } catch (error) {
      toast.dismiss('create-campaign')
      if (error instanceof Error) {
        if (error.message.includes('rejected') || error.message.includes('denied') || error.message.includes('User rejected')) {
          toast.error("Transaction cancelled")
          return
        }
        toast.error("Failed to create campaign", { description: error.message })
      }
    } finally {
      setIsPending(false)
    }
  }

  return {
    createCampaign,
    isPending,
    isSuccess,
    hash,
  }
}
