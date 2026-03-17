'use client'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { createPortal } from 'react-dom'

interface BlockchainLoadingScreenProps {
  open: boolean
  title?: string
  description?: string
}

export function BlockchainLoadingScreen({
  open,
  title = 'Transaction submitted',
  description = 'Waiting for on-chain confirmation...',
}: BlockchainLoadingScreenProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="blockchain-loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-4 w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center shadow-xl"
          >
            <div className="relative mx-auto mb-5 w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              <Loader2 className="absolute inset-0 m-auto h-6 w-6 text-primary opacity-0" />
            </div>
            <p className="font-semibold text-foreground text-base">{title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <p className="mt-4 text-xs text-muted-foreground/60">
              Do not close this tab
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
