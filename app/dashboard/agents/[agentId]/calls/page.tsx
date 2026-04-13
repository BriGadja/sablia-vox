import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { TableSkeleton } from '@/components/skeletons'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/server'
import { CallsListClient } from './CallsListClient'

interface CallsPageProps {
  params: Promise<{ agentId: string }>
}

export const metadata = {
  title: 'Historique des appels | Sablia Vox Dashboard',
  description: 'Liste des appels pour cet agent',
}

export default async function CallsPage({ params }: CallsPageProps) {
  const { agentId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // v2: query v_user_accessible_agents view (RLS-scoped)
  const { data: deployment, error } = await supabase
    .from('v_user_accessible_agents')
    .select('deployment_id, deployment_name')
    .eq('deployment_id', agentId)
    .single()

  if (error || !deployment) {
    notFound()
  }

  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-6">
          <Skeleton className="h-5 w-24" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-48" />
          <TableSkeleton />
        </div>
      }
    >
      <CallsListClient agentId={agentId} agentName={deployment.deployment_name} />
    </Suspense>
  )
}
