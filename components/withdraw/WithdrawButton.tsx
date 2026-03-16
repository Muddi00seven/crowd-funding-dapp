'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
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

interface WithdrawButtonProps {
  campaign: Campaign
}

export function WithdrawButton({ campaign }: WithdrawButtonProps) {
  const { address, isConnected } = useAccount()
  const { withdraw, isPending, isSuccess } = useWithdraw()
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
      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <h3 className="font-semibold">Withdraw Funds</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="block">
              <motion.div
                whileHover={{ scale: goalReached ? 1.02 : 1 }}
                whileTap={{ scale: goalReached ? 0.97 : 1 }}
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
                await withdraw(campaign.id)
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
