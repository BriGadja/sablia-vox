'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Calendar,
  Clock,
  DollarSign,
  ExternalLink,
  FileText,
  Frown,
  Loader2,
  Mail,
  Meh,
  Phone,
  Smile,
  User,
  Volume2,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { AudioPlayer } from '@/components/audio/AudioPlayer'
import { FadeIn } from '@/components/motion'
import { TranscriptDisplay } from '@/components/transcript/TranscriptDisplay'
import { OUTCOME_CONFIG } from '@/lib/constants'
import { fetchCallById } from '@/lib/queries/calls'
import { cn } from '@/lib/utils'

interface CallDetailModalContentProps {
  callId: string
  agentId: string
  agentName: string
}

/**
 * Get outcome display from shared config
 */
function getOutcomeDisplay(outcome: string | null) {
  const entry = OUTCOME_CONFIG[outcome || '']
  return {
    label: entry?.label || outcome || 'Inconnu',
    className: `${entry?.className || 'bg-gray-500/20 text-gray-400'} border-white/10`,
  }
}

/**
 * Emotion badge configuration
 */
const emotionBadges: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  positive: {
    label: 'Positif',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: <Smile className="w-4 h-4" />,
  },
  negative: {
    label: 'Négatif',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: <Frown className="w-4 h-4" />,
  },
  neutral: {
    label: 'Neutre',
    className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    icon: <Meh className="w-4 h-4" />,
  },
}

/**
 * Format duration from seconds to mm:ss
 */
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Call Detail Modal Content
 * Simplified version of call details for modal display
 */
export function CallDetailModalContent({
  callId,
  agentId,
  agentName,
}: CallDetailModalContentProps) {
  // Fetch call data
  const {
    data: call,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['call-detail', callId],
    queryFn: () => fetchCallById(callId),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
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
              Impossible de charger les détails de l&apos;appel
            </p>
          </div>
        </div>
      </div>
    )
  }

  const outcomeDisplay = getOutcomeDisplay(call.outcome)

  const emotionConfig = call.emotion
    ? emotionBadges[call.emotion] || {
        label: call.emotion,
        className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        icon: null,
      }
    : null

  const contactName =
    call.first_name || call.last_name
      ? `${call.first_name || ''} ${call.last_name || ''}`.trim()
      : 'Inconnu'

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between pr-12">
        <div>
          <h2 className="text-xl font-bold text-white">Détail de l&apos;appel</h2>
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Call Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Call Metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            {/* Date */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Calendar className="w-3 h-3" />
                <span>Date</span>
              </div>
              <p className="text-white text-sm font-medium">
                {new Date(call.started_at).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-white/50 text-xs">
                {new Date(call.started_at).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Clock className="w-3 h-3" />
                <span>Durée</span>
              </div>
              <p className="text-white text-sm font-medium">
                {formatDuration(call.duration_seconds ?? 0)}
              </p>
            </div>

            {/* Cost */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <DollarSign className="w-3 h-3" />
                <span>Coût</span>
              </div>
              <p className="text-white text-sm font-medium">
                {call.billed_cost?.toFixed(2) || '0.00'} €
              </p>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Phone className="w-3 h-3" />
                <span>Statut</span>
              </div>
              <p
                className={cn(
                  'text-sm font-medium',
                  call.is_answered ? 'text-green-400' : 'text-red-400',
                )}
              >
                {call.is_answered ? 'Répondu' : 'Non répondu'}
              </p>
            </div>
          </div>

          {/* Outcome & Emotion Badges */}
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1">
              <span className="text-xs text-white/60">Résultat</span>
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium',
                  outcomeDisplay.className,
                )}
              >
                {outcomeDisplay.label}
              </div>
            </div>

            {emotionConfig && (
              <div className="space-y-1">
                <span className="text-xs text-white/60">Émotion</span>
                <div
                  className={cn(
                    'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium',
                    emotionConfig.className,
                  )}
                >
                  {emotionConfig.icon}
                  {emotionConfig.label}
                </div>
              </div>
            )}
          </div>

          {/* Recording */}
          {call.recording_url && (
            <FadeIn>
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-purple-400" />
                  Enregistrement
                </h3>
                <AudioPlayer url={call.recording_url} />
              </div>
            </FadeIn>
          )}

          {/* Transcript */}
          {call.transcript && (
            <FadeIn delay={0.1}>
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Transcription
                </h3>
                <TranscriptDisplay transcript={call.transcript} maxHeight="max-h-48" />
              </div>
            </FadeIn>
          )}
        </div>

        {/* Right Column - Contact Info */}
        <div className="space-y-4">
          {/* Contact Card */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
            <h3 className="text-sm font-medium text-white">Contact</h3>

            <div className="space-y-3">
              {/* Name */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                  <User className="w-3 h-3 text-white/60" />
                </div>
                <div>
                  <p className="text-xs text-white/60">Nom</p>
                  <p className="text-white text-sm">{contactName}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                  <Phone className="w-3 h-3 text-white/60" />
                </div>
                <div>
                  <p className="text-xs text-white/60">Téléphone</p>
                  <p className="text-white text-sm">{call.phone_number}</p>
                </div>
              </div>

              {/* Email */}
              {call.contact_email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Mail className="w-3 h-3 text-white/60" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Email</p>
                    <p className="text-white text-sm break-all">{call.contact_email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Agent Info */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <h3 className="text-sm font-medium text-white">Agent</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-white/60">Nom</p>
                <p className="text-white text-sm">{call.deployment_name}</p>
              </div>
              <div>
                <p className="text-xs text-white/60">Type</p>
                <p className="text-white text-sm capitalize">{call.template_display_name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
