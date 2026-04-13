'use client'

import { cn } from '@/lib/utils'

interface TranscriptTurn {
  speaker: 'agent' | 'client'
  text: string
}

function parseTranscript(raw: string): TranscriptTurn[] {
  const lines = raw.split('\n')
  const turns: TranscriptTurn[] = []

  for (const line of lines) {
    const match = line.match(/^(User|Model)\s*:\s*(.*)$/)
    if (!match) continue

    const speaker: 'agent' | 'client' = match[1] === 'User' ? 'client' : 'agent'
    const text = match[2]
      .replace(/<[^>]*\/?>/g, '') // Strip XML tags
      .replace(/\(tool call\)\s*\w+\s*\{[^}]*\}/g, '') // Strip tool calls
      .trim()

    if (!text) continue

    // Group consecutive same-speaker lines
    const last = turns[turns.length - 1]
    if (last && last.speaker === speaker) {
      last.text += ` ${text}`
    } else {
      turns.push({ speaker, text })
    }
  }
  return turns
}

interface TranscriptDisplayProps {
  transcript: string
  maxHeight?: string
  className?: string
}

export function TranscriptDisplay({
  transcript,
  maxHeight = 'max-h-96',
  className,
}: TranscriptDisplayProps) {
  const turns = parseTranscript(transcript)

  // Fallback: if parsing yields no turns, show raw (stripped) text
  if (turns.length === 0) {
    const stripped = transcript.replace(/<[^>]*\/?>/g, '').trim()
    if (!stripped) return null
    return (
      <div className={cn('bg-black/20 rounded-lg p-4 overflow-y-auto', maxHeight, className)}>
        <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">{stripped}</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3 overflow-y-auto', maxHeight, className)}>
      {turns.map((turn) => (
        <div
          key={`${turn.speaker}-${turn.text.slice(0, 32)}`}
          className={cn(
            'flex flex-col gap-1 max-w-[85%]',
            turn.speaker === 'agent' ? 'items-start' : 'items-end ml-auto',
          )}
        >
          <span className="text-[10px] font-medium uppercase tracking-wider text-white/40 px-1">
            {turn.speaker === 'agent' ? 'Agent' : 'Client'}
          </span>
          <div
            className={cn(
              'rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
              turn.speaker === 'agent'
                ? 'bg-purple-500/10 text-white/80 border border-purple-500/15 rounded-tl-sm'
                : 'bg-white/5 text-white/80 border border-white/10 rounded-tr-sm',
            )}
          >
            {turn.text}
          </div>
        </div>
      ))}
    </div>
  )
}
