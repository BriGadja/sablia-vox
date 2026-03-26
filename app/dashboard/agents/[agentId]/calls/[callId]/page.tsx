import { Loader2 } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { CallDetailClient } from './CallDetailClient'

interface CallDetailPageProps {
  params: Promise<{ agentId: string; callId: string }>
}

export const metadata = {
  title: "Détail de l'appel | Sablia Vox Dashboard",
  description: "Détails complets de l'appel",
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
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      }
    >
      <CallDetailClient callId={callId} agentId={agentId} agentName={call.deployment_name} />
    </Suspense>
  )
}
