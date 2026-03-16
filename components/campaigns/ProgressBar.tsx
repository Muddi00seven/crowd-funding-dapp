'use client'
import { motion } from 'framer-motion'
import { formatUsdt, getProgress } from '@/lib/utils'

interface ProgressBarProps {
  raised: bigint
  goal: bigint
  animated?: boolean
}

export function ProgressBar({ raised, goal, animated = true }: ProgressBarProps) {
  const percentage = getProgress(raised, goal)

  const barColor =
    percentage >= 90
      ? 'bg-success'
      : percentage >= 60
      ? 'bg-warning'
      : 'bg-primary'

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-foreground font-medium">{formatUsdt(raised)} USDT raised</span>
        <span className="text-muted-foreground">of {formatUsdt(goal)} USDT</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        {animated ? (
          <motion.div
            className={`h-2 rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
        ) : (
          <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${percentage}%` }} />
        )}
      </div>
      <div className="text-right text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
    </div>
  )
}
