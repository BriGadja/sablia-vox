'use client'

import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Frown,
  Loader2,
  Mail,
  Meh,
  Pause,
  Phone,
  Play,
  Smile,
  User,
  Volume2,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { OUTCOME_CONFIG } from '@/lib/constants'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { fetchCallById } from '@/lib/queries/calls'
import { cn } from '@/lib/utils'

interface CallDetailClientProps {
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
    label: 'Negatif',
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
 * Audio Player Component
 */
function AudioPlayer({ url }: { url: string }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio] = useState(() => new Audio(url))

  const togglePlay = () => {
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
      <button
        onClick={togglePlay}
        className="p-3 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>
      <div className="flex-1">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 w-0 transition-all" />
        </div>
      </div>
      <Volume2 className="w-5 h-5 text-white/40" />
    </div>
  )
}

/**
 * Call Detail Client Component
 * Displays full details of a specific call
 */
export function CallDetailClient({ callId, agentId, agentName }: CallDetailClientProps) {
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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
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
              Impossible de charger les details de l&apos;appel
            </p>
          </div>
          <Link
            href={`/dashboard/agents/${agentId}/calls`}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            Retour a l&apos;historique
          </Link>
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
      {/* Back Link */}
      <Link
        href={`/dashboard/agents/${agentId}/calls`}
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour a l&apos;historique
      </Link>

      {/* Header */}
      <PageHeader
        title="Detail de l'appel"
        description={`${agentName} - ${new Date(call.started_at).toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Call Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Call Metadata Card */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white">Informations de l&apos;appel</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Date */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Date</span>
                </div>
                <p className="text-white font-medium">
                  {new Date(call.started_at).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-white/50 text-sm">
                  {new Date(call.started_at).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Duration */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Duree</span>
                </div>
                <p className="text-white font-medium">{formatDuration(call.duration_seconds ?? 0)}</p>
              </div>

              {/* Cost */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <DollarSign className="w-4 h-4" />
                  <span>Cout</span>
                </div>
                <p className="text-white font-medium">{call.billed_cost?.toFixed(2) || '0.00'} €</p>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Phone className="w-4 h-4" />
                  <span>Statut</span>
                </div>
                <p className={cn('font-medium', call.is_answered ? 'text-green-400' : 'text-red-400')}>
                  {call.is_answered ? 'Repondu' : 'Non repondu'}
                </p>
              </div>
            </div>

            {/* Outcome & Emotion Badges */}
            <div className="flex flex-wrap gap-3 pt-2 border-t border-white/10">
              <div className="space-y-1">
                <span className="text-xs text-white/60">Resultat</span>
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
                  <span className="text-xs text-white/60">Emotion</span>
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
          </div>

          {/* Recording Section */}
          {call.recording_url && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-400" />
                Enregistrement
              </h3>
              <AudioPlayer url={call.recording_url} />
            </div>
          )}

          {/* Transcript Section */}
          {call.transcript && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Transcription
              </h3>
              <div className="bg-black/20 rounded-lg p-4 max-h-96 overflow-y-auto">
                <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">
                  {call.transcript}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Contact Info */}
        <div className="space-y-6">
          {/* Contact Card */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact</h3>

            <div className="space-y-4">
              {/* Name */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                  <User className="w-4 h-4 text-white/60" />
                </div>
                <div>
                  <p className="text-xs text-white/60">Nom</p>
                  <p className="text-white font-medium">{contactName}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/5">
                  <Phone className="w-4 h-4 text-white/60" />
                </div>
                <div>
                  <p className="text-xs text-white/60">Telephone</p>
                  <p className="text-white font-medium">{call.phone_number}</p>
                </div>
              </div>

              {/* Email */}
              {call.contact_email && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/5">
                    <Mail className="w-4 h-4 text-white/60" />
                  </div>
                  <div>
                    <p className="text-xs text-white/60">Email</p>
                    <p className="text-white font-medium break-all">{call.contact_email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Agent Info Card */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Agent</h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-white/60">Nom</p>
                <p className="text-white font-medium">{call.deployment_name}</p>
              </div>

              <div>
                <p className="text-xs text-white/60">Type</p>
                <p className="text-white font-medium capitalize">{call.template_display_name}</p>
              </div>
            </div>
          </div>

          {/* Extracted Data Card (if present) */}
          {call.extracted_data && Object.keys(call.extracted_data).length > 0 && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Données extraites</h3>
              <div className="bg-black/20 rounded-lg p-4 max-h-48 overflow-y-auto">
                <pre className="text-white/60 text-xs overflow-x-auto">
                  {JSON.stringify(call.extracted_data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
