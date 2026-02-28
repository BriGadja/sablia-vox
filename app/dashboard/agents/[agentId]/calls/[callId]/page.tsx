import { Loader2 } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { CallDetailClient } from './CallDetailClient'

interface CallDetailPageProps {
  params: Promise<{ agentId: string; callId: string }>
}

export const metadata = {
  title: "Detail de l'appel | Sablia Vox Dashboard",
  description: "Details complets de l'appel",
}

/**
 * Call Detail Page - Server Component
 * Displays full details of a specific call
 * Can be rendered as a full page or in a modal via intercepting route
 */
export default async function CallDetailPage({ params }: CallDetailPageProps) {
  const { agentId, callId } = await params
  const supabase = await createClient()

  // Server-side authentication check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify call exists and belongs to the agent
  const { data: call, error } = await supabase
    .from('agent_calls')
    .select(`
      id,
      deployment_id,
      agent_deployments!inner(name, slug)
    `)
    .eq('id', callId)
    .eq('deployment_id', agentId)
    .single()

  if (error || !call) {
    notFound()
  }

  // Extract agent name from the joined data
  const agentDeployment = call.agent_deployments as unknown as { name: string; slug: string }

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <CallDetailClient callId={callId} agentId={agentId} agentName={agentDeployment.name} />
    </Suspense>
  )
}
