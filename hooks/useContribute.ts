'use client'
import { useRef, useState } from 'react'
import { parseUnits } from 'ethers'
import { getCrowdFundingContract, getUsdtContract, CONTRACT_ADDRESS, USDT_TOKEN_ADDRESS, getTxUrl } from '@/lib/contract'
import { useWeb3 } from '@/hooks/useWeb3'
import { toast } from 'sonner'

export type ContributeStep =
  | 'approve-signing'
  | 'approve-confirming'
  | 'contribute-signing'
  | 'contribute-confirming'
  | null

function isUserRejection(e: unknown): boolean {
  const code = (e as { code?: string | number })?.code
  if (code === 4001 || code === 'ACTION_REJECTED') return true
  const msg = ((e as { message?: string })?.message ?? '').toLowerCase()
  return msg.includes('rejected') || msg.includes('denied') || msg.includes('user rejected')
}

export function useContribute() {
  const { getSigner, isConnected } = useWeb3()
  const inFlightRef = useRef(false)
  const [isPending, setIsPending] = useState(false)
  const [pendingStep, setPendingStep] = useState<ContributeStep>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hash, setHash] = useState<string | undefined>()

  const contribute = async (campaignId: bigint, amountUsdt: string): Promise<boolean> => {
    if (inFlightRef.current || !isConnected) return false
    inFlightRef.current = true
    setIsPending(true)
    setIsSuccess(false)

    try {
      const signer = await getSigner()
      const amount = parseUnits(amountUsdt, 6)
      const signerAddress = await signer.getAddress()

      const usdtContract = getUsdtContract(signer)
      const crowdContract = getCrowdFundingContract(signer)

      // Check allowance — only approve if needed
      const allowance = await usdtContract.allowance(signerAddress, CONTRACT_ADDRESS)

      if ((allowance as bigint) < amount) {
        // Step 1a — MetaMask open for approve
        setIsApproving(true)
        setPendingStep('approve-signing')
        toast.loading('Step 1/2: Approving USDT...', {
          id: 'contribute',
          description: 'Confirm the approval in MetaMask',
        })

        const approveTx = await usdtContract.approve(CONTRACT_ADDRESS, amount)

        // Step 1b — Waiting for approve to mine
        setPendingStep('approve-confirming')
        toast.loading('Step 1/2: Confirming approval...', {
          id: 'contribute',
          description: 'Waiting for blockchain confirmation...',
        })
        await approveTx.wait()
        setIsApproving(false)
      }

      // Step 2a — MetaMask open for contribute
      setPendingStep('contribute-signing')
      toast.loading('Step 2/2: Contributing...', {
        id: 'contribute',
        description: 'Confirm the transaction in MetaMask',
      })

      const contributeTx = await crowdContract.contribute(campaignId, amount)
      setHash(contributeTx.hash)

      // Step 2b — Waiting for contribute to mine
      setPendingStep('contribute-confirming')
      toast.loading('Step 2/2: Confirming transaction...', {
        id: 'contribute',
        description: 'Waiting for blockchain confirmation...',
      })
      await contributeTx.wait()

      setIsSuccess(true)
      toast.dismiss('contribute')
      toast.success('Contribution successful!', {
        description: `${amountUsdt} USDT contributed`,
        action: { label: 'View Tx', onClick: () => window.open(getTxUrl(contributeTx.hash), '_blank') },
      })
      return true
    } catch (e: unknown) {
      console.error('[useContribute]', e)
      toast.dismiss('contribute')
      if (isUserRejection(e)) toast.error('Transaction cancelled')
      return false
    } finally {
      setIsPending(false)
      setIsApproving(false)
      setPendingStep(null)
      inFlightRef.current = false
    }
  }

  return { contribute, isPending, pendingStep, isApproving, isSuccess, hash }
}
