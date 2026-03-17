'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useTransactionStore } from '@/store/transactionStore'
import { Loader2, ExternalLink, CheckCircle2, Clock } from 'lucide-react'
import { getTxUrl } from '@/lib/contract'
import { truncateAddress } from '@/lib/utils'

export function TransactionLoadingScreen() {
    const { isPending, message, txHash } = useTransactionStore()

    const isWaitingForSignature = !txHash
    const isConfirming = !!txHash

    return (
        <AnimatePresence>
            {isPending && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-2xl border border-border/50 shadow-2xl max-w-sm w-full mx-4 overflow-hidden relative"
                    >
                        {/* Ambient glow */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-50 pointer-events-none" />

                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />

                        <h3 className="text-xl font-semibold mb-4 text-foreground font-sans">
                            Transaction in Progress
                        </h3>

                        {/* Step indicator */}
                        <div className="w-full space-y-2 mb-5">
                            {/* Step 1 */}
                            <div className="flex items-center gap-3 text-sm">
                                {isWaitingForSignature ? (
                                    <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                )}
                                <span className={isWaitingForSignature ? 'text-foreground' : 'text-muted-foreground line-through'}>
                                    Waiting for wallet signature
                                </span>
                            </div>

                            {/* Step 2 */}
                            <div className="flex items-center gap-3 text-sm">
                                {isConfirming ? (
                                    <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                                ) : (
                                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                )}
                                <span className={isConfirming ? 'text-foreground' : 'text-muted-foreground'}>
                                    Confirming on blockchain
                                </span>
                            </div>
                        </div>

                        {/* Status message */}
                        <p className="text-xs text-muted-foreground mb-4 font-mono">
                            {message || 'Please wait...'}
                        </p>

                        {/* Tx hash + explorer link — only shown after submission */}
                        <AnimatePresence>
                            {txHash && (
                                <motion.a
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    href={getTxUrl(txHash)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs font-mono text-accent hover:text-accent/80 transition-colors bg-muted/50 px-3 py-2 rounded-lg border border-border/40 w-full justify-center"
                                >
                                    <span>{truncateAddress(txHash, 10, 8)}</span>
                                    <ExternalLink className="h-3 w-3 shrink-0" />
                                </motion.a>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
