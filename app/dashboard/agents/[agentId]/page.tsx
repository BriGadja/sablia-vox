import { Loader2 } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { AgentDetailClient } from './AgentDetailClient'

interface PageProps {
  params: Promise<{
    agentId: string
  }>
}

export async function generateMetadata({ params }: PageProps) {
  const { agentId } = await params
  const supabase = await createClient()
  const { data: agent } = await supabase
    .from('v_user_accessible_agents')
    .select('deployment_name')
    .eq('deployment_id', agentId)
    .single()
  const name = agent?.deployment_name || agentId
  return {
    title: `${name} | Sablia Vox Dashboard`,
    description: 'Détails et métriques de votre agent vocal IA',
  }
}

/**
 * Agent Detail Page - Server Component
 * Displays detailed metrics for a specific agent deployment
 */
export default async function AgentDetailPage({ params }: PageProps) {
  const { agentId } = await params
  const supabase = await createClient()

  // Server-side authentication check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check agent exists and is accessible
  const { data: agent } = await supabase
    .from('v_user_accessible_agents')
    .select('deployment_id')
    .eq('deployment_id', agentId)
    .single()

  if (!agent) notFound()

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <AgentDetailClient agentId={agentId} />
    </Suspense>
  )
}
