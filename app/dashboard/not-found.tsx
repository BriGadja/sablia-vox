import Link from 'next/link'

export default function DashboardNotFound() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white">404</h1>
        <p className="mt-2 text-lg text-white/60">
          Page introuvable
        </p>
        <p className="mt-1 text-sm text-white/40">
          La page demandée n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center rounded-lg bg-violet-500/20 px-4 py-2 text-sm font-medium text-violet-400 transition-colors hover:bg-violet-500/30"
        >
          ← Retour au dashboard
        </Link>
      </div>
    </div>
  )
}
