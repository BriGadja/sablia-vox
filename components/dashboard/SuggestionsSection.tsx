'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CheckCircle2, Clock, Lightbulb, XCircle } from 'lucide-react'
import { StaggerChildren, StaggerItem } from '@/components/motion'
import type { ImprovementSuggestion } from '@/lib/queries/agent-insights'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: {
    label: 'En attente',
    icon: <Clock className="w-3.5 h-3.5" />,
    className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  },
  applied: {
    label: 'Appliquée',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    className: 'bg-green-500/15 text-green-400 border-green-500/20',
  },
  dismissed: {
    label: 'Écartée',
    icon: <XCircle className="w-3.5 h-3.5" />,
    className: 'bg-white/5 text-white/40 border-white/10',
  },
}

interface SuggestionsSectionProps {
  suggestions: ImprovementSuggestion[]
}

export function SuggestionsSection({ suggestions }: SuggestionsSectionProps) {
  if (suggestions.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center space-y-3">
        <Lightbulb className="w-10 h-10 text-white/15 mx-auto" />
        <p className="text-white/50 text-sm">
          Aucune suggestion pour le moment — les suggestions sont générées automatiquement.
        </p>
      </div>
    )
  }

  return (
    <StaggerChildren className="space-y-3">
      {suggestions.map((suggestion) => {
        const status = STATUS_CONFIG[suggestion.status] || STATUS_CONFIG.pending

        return (
          <StaggerItem key={suggestion.id}>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-purple-500/15 text-purple-300 border border-purple-500/20 capitalize">
                  {suggestion.suggestion_type}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border',
                      status.className,
                    )}
                  >
                    {status.icon}
                    {status.label}
                  </span>
                  <span className="text-xs text-white/30">
                    {format(new Date(suggestion.created_at), 'dd MMM', { locale: fr })}
                  </span>
                </div>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">
                {suggestion.suggestion_text}
              </p>
            </div>
          </StaggerItem>
        )
      })}
    </StaggerChildren>
  )
}
