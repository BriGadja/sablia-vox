import { useQuery } from '@tanstack/react-query'
import { OUTCOME_CONFIG } from '@/lib/constants'
import { fetchCallById } from '@/lib/queries/calls'

/**
 * Emotion badge configuration — shared between page and modal variants
 */
export const EMOTION_BADGES = {
  positive: {
    label: 'Positif',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  negative: {
    label: 'N\u00E9gatif',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
  neutral: {
    label: 'Neutre',
    className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  },
} as const

const EMOTION_FALLBACK = {
  className: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
} as const

/**
 * Get outcome display label and className from shared config
 */
export function getOutcomeDisplay(outcome: string | null) {
  const entry = OUTCOME_CONFIG[outcome || '']
  return {
    label: entry?.label || outcome || 'Inconnu',
    className: `${entry?.className || 'bg-gray-500/20 text-gray-400'} border-white/10`,
  }
}

/**
 * Get emotion display config
 */
export function getEmotionDisplay(emotion: string | null) {
  if (!emotion) return null
  const badge = EMOTION_BADGES[emotion as keyof typeof EMOTION_BADGES]
  return badge
    ? { label: badge.label, className: badge.className }
    : { label: emotion, className: EMOTION_FALLBACK.className }
}

/**
 * Format duration from seconds to mm:ss
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Build contact display name
 */
export function getContactName(firstName: string | null, lastName: string | null): string {
  return firstName || lastName ? `${firstName || ''} ${lastName || ''}`.trim() : 'Inconnu'
}

/**
 * Hook: fetch call detail by ID
 */
export function useCallDetail(callId: string) {
  return useQuery({
    queryKey: ['call-detail', callId],
    queryFn: () => fetchCallById(callId),
  })
}
