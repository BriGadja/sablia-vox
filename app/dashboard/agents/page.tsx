import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { AgentsGridSkeleton } from '@/components/skeletons'
import { createClient } from '@/lib/supabase/server'
import { AgentsListClient } from './AgentsListClient'

export const metadata = {
  title: 'Agents | Sablia Vox Dashboard',
  description: 'Liste de tous vos agents vocaux IA déployés',
}

/**
 * Agents List Page - Server Component
 * Displays all agent deployments accessible to the user
 */
export default async function AgentsPage() {
  const supabase = await createClient()

  // Server-side authentication check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <Suspense fallback={<AgentsGridSkeleton />}>
      <AgentsListClient />
    </Suspense>
  )
}
