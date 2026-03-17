'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWeb3 } from '@/hooks/useWeb3'
import { Loader2, DollarSign, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useWithdraw } from '@/hooks/useWithdraw'
import { formatUsdt } from '@/lib/utils'
import type { Campaign } from '@/types'
import { BlockchainLoadingScreen } from '@/components/transactions/BlockchainLoadingScreen'

interface WithdrawButtonProps {
  campaign: Campaign
  onSuccess?: () => void
}

export function WithdrawButton({ campaign, onSuccess }: WithdrawButtonProps) {
  const { address, isConnected } = useWeb3()
  const { withdraw, step, isPending, isBlockchainConfirming, isSuccess } = useWithdraw()
  const [open, setOpen] = useState(false)

  const isCreator = isConnected && address?.toLowerCase() === campaign.creator.toLowerCase()
  const goalReached = campaign.raised >= campaign.goal
  const isWithdrawn = campaign.withdrawn

  if (!isCreator) return null

  if (isWithdrawn || isSuccess) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 flex items-center gap-3 text-success">
        <CheckCircle className="w-5 h-5" />
        <span className="font-medium">Funds Withdrawn</span>
      </div>
    )
  }

  return (
    <TooltipProvider>
      {/* Full-screen overlay while withdraw tx is being confirmed on-chain */}
      <BlockchainLoadingScreen
        open={isBlockchainConfirming}
        title="Withdrawal in progress..."
        description="Waiting for on-chain confirmation"
      />

      <div className="rounded-xl border border-border bg-card p-6 space-y-3 relative overflow-hidden">
        <h3 className="font-semibold">Withdraw Funds</h3>

        {/* In-card overlay — shown while MetaMask popup is open */}
        <AnimatePresence>
          {step === 'signing' && (
            <motion.div
              key="withdraw-metamask-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-card/90 backdrop-blur-sm"
            >
              <Loader2 className="w-8 h-8 animate-spin text-success" />
              <div className="text-center space-y-1">
                <p className="font-semibold text-sm">Confirm Withdrawal</p>
                <p className="text-xs text-muted-foreground">Check MetaMask to confirm</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block">
              <motion.div
                whileHover={{ scale: goalReached && !isPending ? 1.02 : 1 }}
                whileTap={{ scale: goalReached && !isPending ? 0.97 : 1 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  className="w-full bg-success hover:bg-success/90 text-white"
                  disabled={!goalReached || isPending}
                  onClick={() => setOpen(true)}
                  aria-label="Withdraw campaign funds"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Withdrawing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Withdraw Funds
                    </>
                  )}
                </Button>
              </motion.div>
            </span>
          </TooltipTrigger>
          {!goalReached && (
            <TooltipContent>
              <p>Goal has not been reached yet</p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Are you sure you want to withdraw {formatUsdt(campaign.raised)} USDT?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button
              className="bg-success hover:bg-success/90 text-white"
              onClick={async () => {
                setOpen(false)
                const success = await withdraw(campaign.id)
                if (success) onSuccess?.()
              }}
              disabled={isPending}
            >
              Confirm Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
