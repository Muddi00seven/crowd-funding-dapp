'use client'
import { useState } from 'react'
import { BrowserProvider, parseUnits } from 'ethers'
import { getCrowdFundingContract, getUsdtContract, CONTRACT_ADDRESS, getTxUrl, pollForReceipt } from '@/lib/contract'
import { useWeb3 } from '@/hooks/useWeb3'
import { toast } from 'sonner'

export function useContribute() {
  const { walletProvider, address, isConnected } = useWeb3()
  const [loading, setLoading] = useState(false)

  const contribute = async (campaignId: bigint, amountUsdt: string): Promise<boolean> => {
    try {
      if (!walletProvider || !address || !isConnected) return false
      setLoading(true)

      const provider = new BrowserProvider(walletProvider)
      const signer = await provider.getSigner()
      const amount = parseUnits(amountUsdt, 6)

      const usdtContract = getUsdtContract(signer)
      const crowdContract = getCrowdFundingContract(signer)

      // Step 1: approve if needed
      const allowance = await usdtContract.allowance(address, CONTRACT_ADDRESS)
      if ((allowance as bigint) < amount) {
        const approveTx = await usdtContract.approve(CONTRACT_ADDRESS, amount)
        await pollForReceipt(approveTx.hash)
      }

      // Step 2: contribute
      const tx = await crowdContract.contribute(campaignId, amount)
      await pollForReceipt(tx.hash)

      setLoading(false)
      toast.success('Contribution successful!', {
        description: `${amountUsdt} USDT contributed`,
        action: { label: 'View Tx', onClick: () => window.open(getTxUrl(tx.hash), '_blank') },
      })
      return true
    } catch (error: unknown) {
      console.log('[useContribute] error:', error)
      setLoading(false)
      const code = (error as { code?: number | string })?.code
      if (code === 4001 || code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled')
      }
      return false
    }
  }

  return { contribute, loading }
}
