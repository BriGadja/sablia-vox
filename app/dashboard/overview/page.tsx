import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/skeletons'
import { createClient } from '@/lib/supabase/server'
import { OverviewDashboardClient } from './OverviewDashboardClient'

export const metadata = {
  title: "Vue d'ensemble | Dashboard Sablia Vox",
  description: 'Dashboard agr\u00E9g\u00E9 de tous vos agents vocaux IA',
}

/**
 * Overview Dashboard Page - Server Component
 * Displays aggregated metrics across all agents
 * Auth is handled by the dashboard layout
 */
export default async function OverviewDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <OverviewDashboardClient userEmail={user?.email || ''} />
    </Suspense>
  )
}
