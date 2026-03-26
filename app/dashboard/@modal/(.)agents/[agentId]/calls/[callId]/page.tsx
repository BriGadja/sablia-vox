import { notFound, redirect } from 'next/navigation'
import { Modal } from '@/components/dashboard/Modal'
import { createClient } from '@/lib/supabase/server'
import { CallDetailModalContent } from './CallDetailModalContent'

interface CallDetailModalProps {
  params: Promise<{ agentId: string; callId: string }>
}

/**
 * Intercepting Route for Call Detail Modal
 * Displays call details in a modal overlay when navigating client-side
 * Falls back to the full page when navigating directly
 */
export default async function CallDetailModal({ params }: CallDetailModalProps) {
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
    <Modal>
      <CallDetailModalContent callId={callId} agentId={agentId} agentName={call.deployment_name} />
    </Modal>
  )
}
