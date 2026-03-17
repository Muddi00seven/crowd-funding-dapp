'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useWeb3 } from '@/hooks/useWeb3'
import { motion } from 'framer-motion'
import { Loader2, Rocket, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCampaignSchema, type CreateCampaignFormData } from '@/lib/validations'
import { useCreateCampaign } from '@/hooks/useCreateCampaign'
import { BlockchainLoadingScreen } from '@/components/transactions/BlockchainLoadingScreen'

export function CreateCampaignForm() {
  const { isConnected } = useWeb3()
  const { createCampaign, loading, isSuccess } = useCreateCampaign()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCampaignFormData>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: { durationDays: 30 },
  })

  useEffect(() => {
    if (isSuccess) {
      reset()
      setTimeout(() => router.push('/'), 1500)
    }
  }, [isSuccess, reset, router])

  const onSubmit = async (data: CreateCampaignFormData) => {
    await createCampaign(data)
  }

  return (
    <>
      <BlockchainLoadingScreen
        open={loading}
        title="Creating your campaign..."
        description="Waiting for on-chain confirmation"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="max-w-2xl mx-auto"
      >
        <div className="rounded-xl border border-border bg-card p-8 space-y-6">
          {!isConnected && (
            <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4">
              <Info className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              <p className="text-sm text-warning">Connect your wallet to create a campaign</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title</Label>
              <Input
                id="title"
                placeholder="e.g. Solar Energy for Rural Schools"
                className="bg-muted border-border"
                disabled={!isConnected || loading}
                aria-label="Campaign title"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={5}
                placeholder="Describe your campaign, its goals, and how the funds will be used..."
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50"
                disabled={!isConnected || loading}
                aria-label="Campaign description"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goalUsdt">Funding Goal (USDT)</Label>
                <Input
                  id="goalUsdt"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="10000"
                  className="bg-muted border-border"
                  disabled={!isConnected || loading}
                  aria-label="Funding goal in USDT"
                  {...register('goalUsdt')}
                />
                {errors.goalUsdt && (
                  <p className="text-xs text-destructive">{errors.goalUsdt.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="durationDays">Duration (Days)</Label>
                <Input
                  id="durationDays"
                  type="number"
                  min="1"
                  max="365"
                  placeholder="30"
                  className="bg-muted border-border"
                  disabled={!isConnected || loading}
                  aria-label="Campaign duration in days"
                  {...register('durationDays', { valueAsNumber: true })}
                />
                {errors.durationDays && (
                  <p className="text-xs text-destructive">{errors.durationDays.message}</p>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">How it works</p>
              <p>• Contributors send USDT directly to the smart contract</p>
              <p>• Funds are locked until your goal is reached</p>
              <p>• Only you (the creator) can withdraw once the goal is met</p>
            </div>

            <motion.div
              whileHover={{ scale: !isConnected || loading ? 1 : 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={!isConnected || loading}
                aria-label="Create campaign"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch Campaign
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </>
  )
}
