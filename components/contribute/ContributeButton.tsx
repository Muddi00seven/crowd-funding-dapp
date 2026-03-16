'use client'
import { motion } from 'framer-motion'
import { Loader2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ContributeButtonProps {
  isPending: boolean
  disabled: boolean
}

export function ContributeButton({ isPending, disabled }: ContributeButtonProps) {
  return (
    <motion.div whileHover={{ scale: disabled || isPending ? 1 : 1.02 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}>
      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90"
        disabled={disabled || isPending}
        aria-label="Submit contribution"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Confirming...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2" />
            Contribute ETH
          </>
        )}
      </Button>
    </motion.div>
  )
}
