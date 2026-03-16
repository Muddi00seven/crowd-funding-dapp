import { Skeleton } from '@/components/ui/skeleton'

export function CampaignSkeleton() {
  return (
    <div className="rounded-xl border border-border p-6 space-y-4 bg-card">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-2 w-full rounded-full" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}
