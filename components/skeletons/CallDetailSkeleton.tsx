import { Skeleton } from '@/components/ui/skeleton'

const META_KEYS = ['date', 'duration', 'cost', 'status']
const LINE_KEYS = ['l1', 'l2', 'l3', 'l4', 'l5']
const CONTACT_KEYS = ['name', 'phone', 'email']

export function CallDetailSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Back link */}
      <Skeleton className="h-5 w-24" />

      {/* Page header */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata card */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-6">
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {META_KEYS.map((key) => (
                <div key={key} className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 pt-2 border-t border-white/10">
              <Skeleton className="h-7 w-32 rounded-full" />
              <Skeleton className="h-7 w-28 rounded-full" />
            </div>
          </div>

          {/* Recording placeholder */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-16 rounded-lg" />
          </div>

          {/* Transcript placeholder */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              {LINE_KEYS.map((key) => (
                <Skeleton key={key} className="h-10 rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Contact card */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <Skeleton className="h-6 w-20" />
            <div className="space-y-4">
              {CONTACT_KEYS.map((key) => (
                <div key={key} className="space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-36" />
                </div>
              ))}
            </div>
          </div>

          {/* Agent card */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <Skeleton className="h-6 w-16" />
            <div className="space-y-3">
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
