'use client'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { CONTRACT_ABI, CONTRACT_ADDRESS, getTxUrl } from '@/lib/contract'
import { toast } from 'sonner'

export function useContribute() {
  const { writeContract, data: hash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const contribute = async (campaignId: bigint, amountEth: string) => {
    try {
      toast.loading("Transaction confirm ho rahi hai...", { id: 'tx-pending', description: "MetaMask confirm karo" })
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'contribute',
        args: [campaignId],
        value: parseEther(amountEth),
      })
    } catch (error) {
      toast.dismiss('tx-pending')
      if (error instanceof Error) {
        if (error.message.includes('rejected') || error.message.includes('denied')) {
          toast.error("Transaction cancel ho gayi")
          return
        }
        if (error.message.includes('insufficient')) {
          toast.error("Insufficient balance", { description: "Wallet mein ETH kam hai" })
          return
        }
        toast.error("Kuch ghalat hua", { description: error.message })
      }
    }
  }

  if (isSuccess && hash) {
    toast.dismiss('tx-pending')
    toast.success("Transaction successful!", {
      description: `ETH contributed!`,
      action: { label: "View Tx", onClick: () => window.open(getTxUrl(hash), '_blank') },
    })
  }

  return {
    contribute,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  }
}
