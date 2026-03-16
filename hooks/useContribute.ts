'use client'
import { useState } from 'react'
import { useWriteContract, useConfig } from 'wagmi'
import { parseUnits } from 'viem'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { CONTRACT_ABI, CONTRACT_ADDRESS, USDT_ABI, USDT_TOKEN_ADDRESS, getTxUrl } from '@/lib/contract'
import { toast } from 'sonner'

export function useContribute() {
  const config = useConfig()
  const { writeContractAsync } = useWriteContract()
  const [isPending, setIsPending] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hash, setHash] = useState<`0x${string}` | undefined>()

  const contribute = async (campaignId: bigint, amountUsdt: string) => {
    setIsPending(true)
    setIsSuccess(false)

    try {
      const amount = parseUnits(amountUsdt, 6)

      // Step 1: Approve USDT spend
      setIsApproving(true)
      toast.loading("Step 1/2: Approving USDT...", {
        id: 'contribute-pending',
        description: "Confirm the approval in MetaMask",
      })

      const approveHash = await writeContractAsync({
        address: USDT_TOKEN_ADDRESS,
        abi: USDT_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS, amount],
      })

      await waitForTransactionReceipt(config, { hash: approveHash })
      setIsApproving(false)

      // Step 2: Contribute
      toast.loading("Step 2/2: Submitting contribution...", {
        id: 'contribute-pending',
        description: "Confirm the transaction in MetaMask",
      })

      const contributeHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'contribute',
        args: [campaignId, amount],
      })

      await waitForTransactionReceipt(config, { hash: contributeHash })

      setHash(contributeHash)
      setIsSuccess(true)
      toast.dismiss('contribute-pending')
      toast.success("Contribution successful!", {
        description: `${amountUsdt} USDT contributed`,
        action: { label: "View Tx", onClick: () => window.open(getTxUrl(contributeHash), '_blank') },
      })
    } catch (error) {
      toast.dismiss('contribute-pending')
      setIsApproving(false)
      if (error instanceof Error) {
        if (error.message.includes('rejected') || error.message.includes('denied') || error.message.includes('User rejected')) {
          toast.error("Transaction cancelled")
          return
        }
        if (error.message.includes('insufficient') || error.message.includes('Insufficient')) {
          toast.error("Insufficient balance", { description: "Not enough USDT in your wallet" })
          return
        }
        toast.error("Transaction failed", { description: error.message })
      }
    } finally {
      setIsPending(false)
    }
  }

  return {
    contribute,
    isPending,
    isApproving,
    isSuccess,
    hash,
  }
}
