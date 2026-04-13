import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { DashboardSkeleton } from '@/components/skeletons'
import { createClient } from '@/lib/supabase/server'
import { OverviewDashboardClient } from './OverviewDashboardClient'

export const metadata = {
  title: "Vue d'ensemble | Dashboard Sablia Vox",
  description: 'Dashboard agrégé de tous vos agents vocaux IA',
}

/**
 * Overview Dashboard Page - Server Component
 * Displays aggregated metrics across all agents
 * Layout: 5 KPIs + 4 charts in 2x2 grid
 */
export default async function OverviewDashboardPage() {
  const supabase = await createClient()

  // Server-side authentication check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <OverviewDashboardClient userEmail={user.email || ''} />
    </Suspense>
  )
}
