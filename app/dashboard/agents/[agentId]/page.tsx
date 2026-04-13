import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { AgentDetailSkeleton } from '@/components/skeletons'
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
    description: 'D\u00E9tails et m\u00E9triques de votre agent vocal IA',
  }
}

/**
 * Agent Detail Page - Server Component
 * Auth is handled by the dashboard layout
 */
export default async function AgentDetailPage({ params }: PageProps) {
  const { agentId } = await params
  const supabase = await createClient()

  // Check agent exists and is accessible
  const { data: agent } = await supabase
    .from('v_user_accessible_agents')
    .select('deployment_id')
    .eq('deployment_id', agentId)
    .single()

  if (!agent) notFound()

  return (
    <Suspense fallback={<AgentDetailSkeleton />}>
      <AgentDetailClient agentId={agentId} />
    </Suspense>
  )
}
