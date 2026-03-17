'use client'
import { parseUnits } from 'ethers'
import { getCrowdFundingContract, getUsdtContract, CONTRACT_ADDRESS, getTxUrl } from '@/lib/contract'
import { useWeb3 } from '@/hooks/useWeb3'
import { toast } from 'sonner'
import { getAuthorizedSigner } from '@/lib/authorizedSigner'

import { useTransactionStore } from '@/store/transactionStore'

export function useContribute() {
  const { walletProvider, address, isConnected } = useWeb3()
  // const [loading, setLoading] = useState(false)
  const setPending = useTransactionStore((state) => state.setPending)
  const triggerRefresh = useTransactionStore((state) => state.triggerRefresh)

  const contribute = async (campaignId: bigint, amountUsdt: string): Promise<boolean> => {
    try {
      if (!walletProvider || !address || !isConnected) return false

      setPending(true, 'Waiting for signature in wallet...')

      const { signer } = await getAuthorizedSigner(walletProvider, address)
      const amount = parseUnits(amountUsdt, 6)
      console.log("txtxtxtx", amount)

      const usdtContract = getUsdtContract(signer)
      let crowdContract = getCrowdFundingContract(signer)

      // Step 1: approve if needed
      const allowance = await usdtContract.allowance(address, CONTRACT_ADDRESS)
      if ((allowance as bigint) < amount) {
        setPending(true, 'Approving USDT spend allowance...')
        const approveTx = await usdtContract.approve(CONTRACT_ADDRESS, amount)
        setPending(true, 'Processing USDT approval on blockchain...', approveTx.hash)
        await approveTx.wait(1)

        // Re-request accounts to re-wake the wallet after the long wait.
        // Opera + MetaMask returns 4100 on the second tx without this.
        const { signer: freshSigner } = await getAuthorizedSigner(walletProvider, address)
        crowdContract = getCrowdFundingContract(freshSigner)
        setPending(true, 'Waiting for contribution signature in wallet...')
      }

      // Step 2: contribute
      const tx = await crowdContract.contribute(campaignId, amount)
      console.log("txtxtxtx", tx)
      setPending(true, 'Processing contribution on blockchain...', tx.hash)
      await tx.wait(1)

      setPending(false)
      triggerRefresh()

      toast.success('Contribution successful!', {
        description: `${amountUsdt} USDT contributed`,
        action: { label: 'View Tx', onClick: () => window.open(getTxUrl(tx.hash), '_blank') },
      })
      return true
    } catch (error: unknown) {
      console.log('[useContribute] error:', error)
      setPending(false)
      const code = (error as { code?: number | string })?.code
      if (code === 4001 || code === 'ACTION_REJECTED') {
        toast.error('Transaction cancelled')
      } else if (code === 4100) {
        toast.error('Wallet authorization lost. Reconnect MetaMask and try again.')
      }
      return false
    }
  }

  const loading = useTransactionStore((state) => state.isPending)

  return { contribute, loading }
}
