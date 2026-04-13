'use client'

import { ArrowLeft, XCircle } from 'lucide-react'
import Link from 'next/link'
import { CallDetailContent, useCallDetail } from '@/components/dashboard/CallDetail'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { CallDetailSkeleton } from '@/components/skeletons'

interface CallDetailClientProps {
  callId: string
  agentId: string
  agentName: string
}

/**
 * Call Detail Client Component — full page variant
 * Displays full details of a specific call
 */
export function CallDetailClient({ callId, agentId, agentName }: CallDetailClientProps) {
  const { data: call, isLoading, error } = useCallDetail(callId)

  if (isLoading) {
    return <CallDetailSkeleton />
  }

  if (error || !call) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="p-4 rounded-full bg-red-500/10">
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-white">Erreur de chargement</p>
            <p className="text-sm text-white/60">
              Impossible de charger les d&eacute;tails de l&apos;appel
            </p>
          </div>
          <Link
            href={`/dashboard/agents/${agentId}/calls`}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Retour &agrave; l&apos;historique
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 page-fade-in">
      {/* Back Link */}
      <Link
        href={`/dashboard/agents/${agentId}/calls`}
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour &agrave; l&apos;historique
      </Link>

      {/* Header */}
      <PageHeader
        title="D\u00E9tail de l'appel"
        description={`${agentName} - ${new Date(call.started_at).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`}
      />

      <CallDetailContent call={call} variant="page" />
    </div>
  )
}
