import { Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { PerformanceClient } from './PerformanceClient'

export const metadata = {
  title: 'Performance | Sablia Vox Dashboard',
  description: 'Analysez les performances globales de vos agents vocaux IA',
}

/**
 * Performance Page - Server Component
 * Displays advanced performance analytics across all agents
 */
export default async function PerformancePage() {
  const supabase = await createClient()

  // Server-side authentication check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <PerformanceClient />
    </Suspense>
  )
}
