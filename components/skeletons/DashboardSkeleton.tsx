import { Skeleton } from '@/components/ui/skeleton'

const KPI_KEYS = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6']
const CHART_KEYS = ['c1', 'c2', 'c3', 'c4']

export function DashboardSkeleton() {
  return (
    <div className="h-full p-6 overflow-hidden">
      <div className="flex flex-col gap-4 h-full">
        {/* Filters row */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between flex-shrink-0">
          <div className="flex gap-3">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-36" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* KPIs Grid */}
        <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {KPI_KEYS.map((key) => (
            <Skeleton key={key} className="h-20 rounded-xl" />
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          {CHART_KEYS.map((key) => (
            <Skeleton key={key} className="h-[300px] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
