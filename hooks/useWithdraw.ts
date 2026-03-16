'use client'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ABI, CONTRACT_ADDRESS, getTxUrl } from '@/lib/contract'
import { toast } from 'sonner'

export function useWithdraw() {
  const { writeContract, data: hash, isPending } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const withdraw = async (campaignId: bigint) => {
    try {
      toast.loading("Withdrawal pending...", { id: 'withdraw-pending', description: "MetaMask confirm karo" })
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'withdraw',
        args: [campaignId],
      })
    } catch (error) {
      toast.dismiss('withdraw-pending')
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
    toast.dismiss('withdraw-pending')
    toast.success("Funds withdrawn!", {
      description: "ETH aapke wallet mein transfer ho gayi",
      action: { label: "View Tx", onClick: () => window.open(getTxUrl(hash), '_blank') },
    })
  }

  return {
    withdraw,
    isPending: isPending || isConfirming,
    isSuccess,
    hash,
  }
}
