import { Skeleton } from '@/components/ui/skeleton'

const AGENT_KEYS = ['a1', 'a2', 'a3', 'a4']
const TOTAL_KEYS = ['base', 'overage', 'sms', 'total']

export function ConsumptionSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Date picker row */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-9 w-36 rounded-lg" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* Agent cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AGENT_KEYS.map((key) => (
          <Skeleton key={key} className="h-40 rounded-xl" />
        ))}
      </div>

      {/* Totals section */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TOTAL_KEYS.map((key) => (
            <div key={key} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
