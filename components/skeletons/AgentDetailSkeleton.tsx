import { Skeleton } from '@/components/ui/skeleton'

const KPI_KEYS = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6']
const CHART_KEYS = ['c1', 'c2', 'c3', 'c4']
const SUGGESTION_KEYS = ['s1', 's2', 's3']

export function AgentDetailSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {/* Agent header */}
      <Skeleton className="h-16 rounded-xl" />

      {/* Date filter */}
      <Skeleton className="h-10 w-48" />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {KPI_KEYS.map((key) => (
          <Skeleton key={key} className="h-20 rounded-xl" />
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {CHART_KEYS.map((key) => (
          <Skeleton key={key} className="h-[300px] rounded-xl" />
        ))}
      </div>

      {/* Quality trend chart */}
      <Skeleton className="h-[300px] rounded-xl" />

      {/* Suggestions */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-40" />
        {SUGGESTION_KEYS.map((key) => (
          <Skeleton key={key} className="h-12 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
