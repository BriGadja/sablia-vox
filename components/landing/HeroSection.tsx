'use client'
// 'use client' needed: PhoneCallbackCTA is a client component embedded here

import { Badge } from '@/components/ui/badge'
import { PhoneCallbackCTA } from './PhoneCallbackCTA'
import { WaveformVisual } from './WaveformVisual'

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center overflow-hidden bg-background pt-16"
    >
      {/* Background gradient mesh */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: [
            'radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.35 0.14 230 / 0.25) 0%, transparent 70%)',
            'radial-gradient(ellipse 50% 50% at 80% 80%, oklch(0.30 0.10 260 / 0.15) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      {/* Waveform background */}
      <WaveformVisual />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Headline */}
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            Chaque appel manqué est un client perdu.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Notre agent vocal IA répond 24/7, qualifie vos prospects et prend vos rendez-vous — en
            moins de 60 secondes.
          </p>

          {/* Phone callback CTA */}
          <div className="mx-auto mt-10 max-w-md">
            <PhoneCallbackCTA />
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Badge
              variant="secondary"
              className="gap-1.5 border-border bg-card/60 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
            >
              <span aria-hidden="true">🇫🇷</span> Hébergé en France
            </Badge>
            <Badge
              variant="secondary"
              className="gap-1.5 border-border bg-card/60 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
            >
              <span aria-hidden="true">⚡</span> Opérationnel en 48h
            </Badge>
          </div>
        </div>
      </div>
    </section>
  )
}
