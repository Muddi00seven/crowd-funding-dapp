'use client'
import { useRef, useState } from 'react'
import { parseUnits } from 'ethers'
import { getCrowdFundingContract, getUsdtContract, CONTRACT_ADDRESS, getTxUrl } from '@/lib/contract'
import { useWeb3 } from '@/hooks/useWeb3'
import { toast } from 'sonner'

export type ContributeStep =
  | 'idle'
  | 'signing-approve'       // MetaMask open — user must approve USDT spend
  | 'confirming-approve'    // approve tx submitted, waiting for on-chain confirmation
  | 'signing-contribute'    // MetaMask open — user must approve contribute tx
  | 'confirming-contribute' // contribute tx submitted, waiting for on-chain confirmation

function isUserRejection(e: unknown): boolean {
  const code = (e as { code?: string | number })?.code
  if (code === 4001 || code === 'ACTION_REJECTED') return true
  const msg = ((e as { message?: string })?.message ?? '').toLowerCase()
  return msg.includes('rejected') || msg.includes('denied') || msg.includes('user rejected')
}

export function useContribute() {
  const { getSigner, isConnected } = useWeb3()
  const inFlightRef = useRef(false)
  const [step, setStep] = useState<ContributeStep>('idle')

  const isPending = step !== 'idle'
  const isApproving = step === 'signing-approve' || step === 'confirming-approve'
  // Full-screen loading screen shows only while waiting for on-chain confirmation
  const isBlockchainConfirming =
    step === 'confirming-approve' || step === 'confirming-contribute'

  const contribute = async (campaignId: bigint, amountUsdt: string): Promise<boolean> => {
    if (inFlightRef.current || !isConnected) return false
    inFlightRef.current = true

    try {
      const signer = await getSigner()
      const amount = parseUnits(amountUsdt, 6)
      const signerAddress = await signer.getAddress()

      const usdtContract = getUsdtContract(signer)
      const crowdContract = getCrowdFundingContract(signer)

      const allowance = await usdtContract.allowance(signerAddress, CONTRACT_ADDRESS)

      if ((allowance as bigint) < amount) {
        // ── Step 1a: MetaMask open for USDT approval ──
        setStep('signing-approve')
        toast.loading('Step 1/2 — Approve USDT', {
          id: 'contribute',
          description: 'Confirm the approval in MetaMask',
        })

        const approveTx = await usdtContract.approve(CONTRACT_ADDRESS, amount)

        // ── Step 1b: Approve tx submitted — waiting for blockchain ──
        setStep('confirming-approve')
        toast.loading('Step 1/2 — Confirming approval...', {
          id: 'contribute',
          description: 'Waiting for on-chain confirmation',
        })
        await approveTx.wait()
      }

      // ── Step 2a: MetaMask open for contribute ──
      setStep('signing-contribute')
      toast.loading('Step 2/2 — Contribute USDT', {
        id: 'contribute',
        description: 'Confirm the transaction in MetaMask',
      })

      const contributeTx = await crowdContract.contribute(campaignId, amount)

      // ── Step 2b: Contribute tx submitted — waiting for blockchain ──
      setStep('confirming-contribute')
      toast.loading('Step 2/2 — Confirming transaction...', {
        id: 'contribute',
        description: 'Waiting for on-chain confirmation',
      })
      await contributeTx.wait()

      toast.dismiss('contribute')
      toast.success('Contribution successful!', {
        description: `${amountUsdt} USDT contributed`,
        action: {
          label: 'View Tx',
          onClick: () => window.open(getTxUrl(contributeTx.hash), '_blank'),
        },
      })
      return true
    } catch (e: unknown) {
      console.error('[useContribute]', e)
      toast.dismiss('contribute')
      if (isUserRejection(e)) {
        toast.error('Transaction cancelled')
      } else {
        toast.error('Transaction failed', {
          description: (e as { message?: string })?.message,
        })
      }
      return false
    } finally {
      setStep('idle')
      inFlightRef.current = false
    }
  }

  return { contribute, step, isPending, isApproving, isBlockchainConfirming }
}
