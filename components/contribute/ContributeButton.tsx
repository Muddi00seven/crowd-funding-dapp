'use client'
import { motion } from 'framer-motion'
import { Loader2, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ContributeButtonProps {
  isPending: boolean
  isApproving: boolean
  disabled: boolean
}

export function ContributeButton({ isPending, isApproving, disabled }: ContributeButtonProps) {
  const label = isApproving
    ? 'Approving USDT...'
    : isPending
    ? 'Confirming...'
    : 'Contribute USDT'

  return (
    <motion.div whileHover={{ scale: disabled || isPending ? 1 : 1.02 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90"
        disabled={disabled || isPending}
        aria-label="Submit USDT contribution"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {label}
          </>
        ) : (
          <>
            <Coins className="w-4 h-4 mr-2" />
            {label}
          </>
        )}
      </Button>
      {isPending && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          {isApproving ? 'Step 1/2: Approving USDT spend...' : 'Step 2/2: Submitting contribution...'}
        </p>
      )}
    </motion.div>
  )
}
