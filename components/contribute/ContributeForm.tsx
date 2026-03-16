'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ContributeButton } from './ContributeButton'
import { contributeSchema, type ContributeFormData } from '@/lib/validations'
import { useContribute } from '@/hooks/useContribute'

interface ContributeFormProps {
  campaignId: bigint
  isExpired: boolean
}

export function ContributeForm({ campaignId, isExpired }: ContributeFormProps) {
  const { isConnected } = useAccount()
  const { contribute, isPending, isSuccess } = useContribute()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContributeFormData>({
    resolver: zodResolver(contributeSchema),
  })

  const onSubmit = async (data: ContributeFormData) => {
    await contribute(campaignId, data.amount)
    if (isSuccess) reset()
  }

  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-6 space-y-4"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <h3 className="font-semibold text-lg">Contribute</h3>

      {!isConnected && (
        <p className="text-sm text-muted-foreground">
          Contribute karne ke liye wallet connect karo
        </p>
      )}

      {isExpired && (
        <p className="text-sm text-destructive">
          Yeh campaign expire ho gayi hai
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (ETH)</Label>
          <Input
            id="amount"
            type="number"
            step="0.001"
            min="0.001"
            max="100"
            placeholder="0.1"
            className="bg-muted border-border"
            disabled={!isConnected || isExpired || isPending}
            aria-label="Contribution amount in ETH"
            {...register('amount')}
          />
          {errors.amount && (
            <p className="text-xs text-destructive">{errors.amount.message}</p>
          )}
        </div>

        <ContributeButton
          isPending={isPending}
          disabled={!isConnected || isExpired}
        />
      </form>
    </motion.div>
  )
}
