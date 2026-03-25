'use client'
// 'use client' needed: CSS animation control + optional motion state from parent

import { cn } from '@/lib/utils'

interface WaveformVisualProps {
  /** Whether the waveform should be in "calling" intensified state */
  calling?: boolean
  className?: string
}

const BAR_COUNT = 40

/** Pre-computed bar heights for deterministic rendering (avoids Math.random in render) */
const BAR_HEIGHTS = Array.from(
  { length: BAR_COUNT },
  (_, i) => 20 + Math.sin(i * 0.5) * 40 + ((i * 17 + 7) % 30),
)

export function WaveformVisual({ calling = false, className }: WaveformVisualProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-20',
        calling && 'opacity-40',
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${BAR_COUNT * 12} 200`}
        className="h-full w-full max-w-4xl"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Animation de forme d'onde vocale"
      >
        <title>Forme d'onde vocale</title>
        {BAR_HEIGHTS.map((baseHeight, i) => {
          const delay = i * 0.08
          return (
            <rect
              key={`bar-${i.toString()}`}
              x={i * 12 + 2}
              y={100 - baseHeight / 2}
              width={6}
              rx={3}
              height={baseHeight}
              className={cn(
                'fill-primary motion-safe:animate-[waveform-bar_3s_ease-in-out_infinite]',
                calling && 'motion-safe:animate-[waveform-bar-calling_0.5s_ease-in-out_infinite]',
              )}
              style={{
                animationDelay: `${delay}s`,
                transformOrigin: `${i * 12 + 5}px 100px`,
              }}
            />
          )
        })}
      </svg>
    </div>
  )
}
