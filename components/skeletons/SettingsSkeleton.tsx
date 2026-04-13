import { Skeleton } from '@/components/ui/skeleton'

const FIELD_KEYS = ['name', 'slug', 'industry', 'email']

export function SettingsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="w-8 h-8 rounded" />
          <Skeleton className="h-9 w-40" />
        </div>
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-10 w-36 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      {/* Form content */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FIELD_KEYS.map((key) => (
            <div key={key} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
