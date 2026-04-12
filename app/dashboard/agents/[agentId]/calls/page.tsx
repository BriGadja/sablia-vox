import { Loader2 } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
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
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <CallsListClient
        agentId={agentId}
        agentName={deployment.deployment_name}
      />
    </Suspense>
  )
}
