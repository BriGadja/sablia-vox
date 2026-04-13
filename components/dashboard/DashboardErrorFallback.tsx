'use client'

import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface DashboardErrorFallbackProps {
  error: Error & { digest?: string }
  resetErrorBoundary: () => void
}

/**
 * Error fallback component for dashboard error boundaries
 * Displays a user-friendly error message with recovery options
 */
export function DashboardErrorFallback({ error, resetErrorBoundary }: DashboardErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="p-4 rounded-full bg-red-500/10 mb-6">
        <AlertTriangle className="w-12 h-12 text-red-500" />
      </div>

      <h2 className="text-xl font-bold text-white mb-2">Une erreur est survenue</h2>

      <p className="text-white/60 text-center max-w-md mb-4">
        Nous n&apos;avons pas pu charger les données du dashboard. Veuillez réessayer ou retourner à
        l&apos;accueil.
      </p>

      {process.env.NODE_ENV === 'development' && (
        <details className="mb-6 max-w-lg w-full">
          <summary className="text-xs text-red-400 cursor-pointer hover:text-red-300 mb-2">
            Détails de l&apos;erreur (dev only)
          </summary>
          <pre className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg overflow-auto max-h-32">
            {error.message}
            {error.digest && `\nDigest: ${error.digest}`}
          </pre>
        </details>
      )}

      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors"
        >
          <Home className="w-4 h-4" />
          Accueil Dashboard
        </Link>
        <button
          type="button"
          onClick={resetErrorBoundary}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Reessayer
        </button>
      </div>
    </div>
  )
}
