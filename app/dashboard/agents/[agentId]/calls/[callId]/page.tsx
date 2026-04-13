import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { CallDetailSkeleton } from '@/components/skeletons'
import { createClient } from '@/lib/supabase/server'
import { CallDetailClient } from './CallDetailClient'

interface CallDetailPageProps {
  params: Promise<{ agentId: string; callId: string }>
}

export const metadata = {
  title: "D\u00E9tail de l'appel | Sablia Vox Dashboard",
  description: "D\u00E9tails complets de l'appel",
}

/**
 * Call Detail Page - Server Component
 * Auth is handled by the dashboard layout
 */
export default async function CallDetailPage({ params }: CallDetailPageProps) {
  const { agentId, callId } = await params
  const supabase = await createClient()

  // Verify call exists via v_dashboard_calls view (RLS scoped)
  const { data: call, error } = await supabase
    .from('v_dashboard_calls')
    .select('call_id, deployment_id, deployment_name')
    .eq('call_id', callId)
    .eq('deployment_id', agentId)
    .single()

  if (error || !call) {
    notFound()
  }

  return (
    <Suspense fallback={<CallDetailSkeleton />}>
      <CallDetailClient callId={callId} agentId={agentId} agentName={call.deployment_name} />
    </Suspense>
  )
}
