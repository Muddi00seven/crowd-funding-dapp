'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount } from 'wagmi'
import { Wallet, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ContributeButton } from './ContributeButton'
import { contributeSchema, type ContributeFormData } from '@/lib/validations'
import { useContribute } from '@/hooks/useContribute'
import { useTokenBalance } from '@/hooks/useTokenBalance'

interface ContributeFormProps {
  campaignId: bigint
  isExpired: boolean
  onSuccess?: () => void
}

export function ContributeForm({ campaignId, isExpired, onSuccess }: ContributeFormProps) {
  const { isConnected } = useAccount()
  const { contribute, isPending, isApproving, pendingStep, isSuccess } = useContribute()
  const { formatted: balanceFormatted, refetch: refetchBalance } = useTokenBalance()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContributeFormData>({
    resolver: zodResolver(contributeSchema),
  })

  const onSubmit = async (data: ContributeFormData) => {
    const success = await contribute(campaignId, data.amount)
    if (success) {
      reset()
      refetchBalance()
      onSuccess?.()
    }
  }

  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-6 space-y-4 relative overflow-hidden"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Transaction pending overlay */}
      <AnimatePresence>
        {isPending && (
          <motion.div
            key="pending-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-card/90 backdrop-blur-sm"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <div className="text-center space-y-1">
              <p className="font-semibold text-sm">
                {pendingStep === 'approve-signing' && 'Step 1/2 — Approving USDT'}
                {pendingStep === 'approve-confirming' && 'Step 1/2 — Confirming Approval'}
                {pendingStep === 'contribute-signing' && 'Step 2/2 — Contributing'}
                {pendingStep === 'contribute-confirming' && 'Step 2/2 — Confirming Transaction'}
                {!pendingStep && isPending && 'Processing...'}
              </p>
              <p className="text-xs text-muted-foreground">
                {(pendingStep === 'approve-signing' || pendingStep === 'contribute-signing')
                  ? 'Confirm in MetaMask'
                  : 'Waiting for blockchain confirmation...'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Contribute</h3>
        {isConnected && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
            <Wallet className="w-3 h-3" />
            <span>{balanceFormatted} USDT</span>
          </div>
        )}
      </div>

      {!isConnected && (
        <p className="text-sm text-muted-foreground">
          Connect your wallet to contribute
        </p>
      )}

      {isExpired && (
        <p className="text-sm text-destructive">
          This campaign has expired
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (USDT)</Label>
          <Input
            id="amount"
            type="number"
            step="1"
            min="1"
            max="100000"
            placeholder="100"
            className="bg-muted border-border"
            disabled={!isConnected || isExpired || isPending}
            aria-label="Contribution amount in USDT"
            {...register('amount')}
          />
          {errors.amount && (
            <p className="text-xs text-destructive">{errors.amount.message}</p>
          )}
        </div>

        <ContributeButton
          isPending={isPending}
          isApproving={isApproving}
          disabled={!isConnected || isExpired}
        />
      </form>
    </motion.div>
  )
}
