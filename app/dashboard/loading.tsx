const KPI_SKELETON_KEYS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7']
const CHART_SKELETON_KEYS = ['c1', 'c2', 'c3', 'c4']

export default function Loading() {
  return (
    <div className="min-h-screen p-6 max-w-[1600px] mx-auto">
      <div className="mb-8 animate-pulse">
        <div className="h-10 w-64 bg-white/10 rounded mb-2" />
        <div className="h-6 w-96 bg-white/10 rounded" />
      </div>

      <div className="mb-8 p-6 bg-black/20 border border-white/20 rounded-xl">
        <div className="h-32 bg-white/10 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {KPI_SKELETON_KEYS.map((key) => (
          <div
            key={key}
            className="h-32 bg-black/20 border border-white/20 rounded-xl animate-pulse"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {CHART_SKELETON_KEYS.map((key) => (
          <div
            key={key}
            className="h-96 bg-black/20 border border-white/20 rounded-xl animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}
