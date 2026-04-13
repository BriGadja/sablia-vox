'use client'

import { ExternalLink, XCircle } from 'lucide-react'
import Link from 'next/link'
import { CallDetailContent, useCallDetail } from '@/components/dashboard/CallDetail'
import { Skeleton } from '@/components/ui/skeleton'

interface CallDetailModalContentProps {
  callId: string
  agentId: string
  agentName: string
}

/**
 * Call Detail Modal Content — compact modal variant
 * Simplified version of call details for modal display
 */
export function CallDetailModalContent({
  callId,
  agentId,
  agentName,
}: CallDetailModalContentProps) {
  const { data: call, isLoading, error } = useCallDetail(callId)

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between pr-12">
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !call) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="p-4 rounded-full bg-red-500/10">
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-white">Erreur de chargement</p>
            <p className="text-sm text-white/60">
              Impossible de charger les d&eacute;tails de l&apos;appel
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between pr-12">
        <div>
          <h2 className="text-xl font-bold text-white">D&eacute;tail de l&apos;appel</h2>
          <p className="text-sm text-white/60 mt-1">
            {agentName} -{' '}
            {new Date(call.started_at).toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <Link
          href={`/dashboard/agents/${agentId}/calls/${callId}`}
          className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Ouvrir en pleine page
        </Link>
      </div>

      <CallDetailContent call={call} variant="modal" />
    </div>
  )
}
