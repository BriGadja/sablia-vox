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

/**
 * Calls History Page - Server Component
 * Displays paginated list of calls for a specific agent deployment
 */
export default async function CallsPage({ params }: CallsPageProps) {
  const { agentId } = await params
  const supabase = await createClient()

  // Server-side authentication check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify agent deployment exists and user has access
  const { data: deployment, error } = await supabase
    .from('agent_deployments')
    .select(`
      id,
      name,
      slug,
      clients(name)
    `)
    .eq('id', agentId)
    .single()

  if (error || !deployment) {
    notFound()
  }

  // Extract client name from the joined data
  const client = deployment.clients as unknown as { name: string } | null

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <CallsListClient
        agentId={agentId}
        agentName={deployment.name}
        clientName={client?.name || ''}
      />
    </Suspense>
  )
}
