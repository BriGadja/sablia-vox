import { Skeleton } from '@/components/ui/skeleton'

const HEADER_KEYS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
const DEFAULT_ROW_KEYS = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8']
const CELL_KEYS = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6']

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  const rowKeys = DEFAULT_ROW_KEYS.slice(0, rows)
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      {/* Table header */}
      <div className="bg-white/5 px-4 py-3 flex gap-4">
        {HEADER_KEYS.map((key) => (
          <Skeleton key={key} className="h-4 flex-1" />
        ))}
      </div>
      {/* Table rows */}
      <div className="divide-y divide-white/5">
        {rowKeys.map((rowKey) => (
          <div key={rowKey} className="px-4 py-3 flex gap-4 items-center">
            {CELL_KEYS.map((cellKey) => (
              <Skeleton key={cellKey} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
