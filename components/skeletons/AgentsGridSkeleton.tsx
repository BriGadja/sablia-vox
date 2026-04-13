import { Skeleton } from '@/components/ui/skeleton'

const BADGE_KEYS = ['b1', 'b2', 'b3']
const AGENT_KEYS = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6']

export function AgentsGridSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Date filter */}
      <Skeleton className="h-10 w-48" />

      {/* Template badges */}
      <div className="flex items-center gap-4">
        {BADGE_KEYS.map((key) => (
          <Skeleton key={key} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      {/* Agent cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {AGENT_KEYS.map((key) => (
          <Skeleton key={key} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
