import { Loader2 } from 'lucide-react'
import { redirect } from 'next/navigation'
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
  return {
    title: `Agent ${agentId} | Sablia Vox Dashboard`,
    description: 'Details et metriques de votre agent vocal IA',
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
