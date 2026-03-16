'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface BlockchainLoadingScreenProps {
  open: boolean
  title?: string
  description?: string
}

export function BlockchainLoadingScreen({
  open,
  title = 'Transaction submitted',
  description = 'Waiting for blockchain confirmation...',
}: BlockchainLoadingScreenProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="blockchain-loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-sm"
        >
          <div className="mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-xl">
            <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
            <p className="font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
