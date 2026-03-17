'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useWeb3 } from '@/hooks/useWeb3'
import { Wallet } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ContributeButton } from './ContributeButton'
import { contributeSchema, type ContributeFormData } from '@/lib/validations'
import { useContribute } from '@/hooks/useContribute'
import { useTokenBalance } from '@/hooks/useTokenBalance'
import { BlockchainLoadingScreen } from '@/components/transactions/BlockchainLoadingScreen'

interface ContributeFormProps {
  campaignId: bigint
  isExpired: boolean
  isCreator: boolean
  hasContributed: boolean
  onSuccess?: () => void
}

export function ContributeForm({ campaignId, isExpired, isCreator, hasContributed, onSuccess }: ContributeFormProps) {
  const { isConnected } = useWeb3()
  const { contribute, loading } = useContribute()
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
    <>
      <BlockchainLoadingScreen
        open={loading}
        title="Transaction pending..."
        description="Waiting for on-chain confirmation"
      />

      <motion.div
        className="rounded-xl border border-border bg-card p-6 space-y-4"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
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
          <p className="text-sm text-muted-foreground">Connect your wallet to contribute</p>
        )}

        {isExpired && (
          <p className="text-sm text-destructive">This campaign has expired</p>
        )}

        {isCreator && (
          <p className="text-sm text-muted-foreground">You are the creator of this campaign</p>
        )}

        {!isCreator && hasContributed && (
          <p className="text-sm text-success">You have already contributed to this campaign</p>
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
              disabled={!isConnected || isExpired || loading || isCreator || hasContributed}
              aria-label="Contribution amount in USDT"
              {...register('amount')}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <ContributeButton
            isPending={loading}
            isApproving={false}
            disabled={!isConnected || isExpired || isCreator || hasContributed}
          />
        </form>
      </motion.div>
    </>
  )
}
