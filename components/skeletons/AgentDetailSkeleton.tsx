import { Skeleton } from '@/components/ui/skeleton'

const KPI_KEYS = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6']
const CHART_KEYS = ['c1', 'c2', 'c3', 'c4']

export function AgentDetailSkeleton() {
  return (
    <div className="h-full p-6">
      <div className="flex flex-col gap-4 h-full">
        {/* Filters row */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {KPI_KEYS.map((key) => (
            <Skeleton key={key} className="h-20 rounded-xl" />
          ))}
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          {CHART_KEYS.map((key) => (
            <Skeleton key={key} className="h-[300px] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
