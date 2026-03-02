import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Dashboard | Sablia Vox',
  description: 'Tableau de bord analytique pour vos agents vocaux IA',
}

/**
 * Dashboard Root Page - Server Component
 * Redirects to /dashboard/overview
 * The overview page now handles the aggregated view with 6 KPIs and 4 charts
 */
export default async function DashboardPage() {
  const supabase = await createClient()

  // Server-side authentication check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Always redirect to overview dashboard
  redirect('/dashboard/overview')
}
