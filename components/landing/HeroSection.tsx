'use client'
// 'use client' needed: Motion animations for hero entrance sequence

import { motion } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { PhoneCallbackCTA } from './PhoneCallbackCTA'
import { WaveformVisual } from './WaveformVisual'

const HEADLINE_WORDS = ['Chaque', 'appel', 'manqué', 'est', 'un', 'client', 'perdu.']

const wordTransition = (i: number) => ({
  delay: 0.3 + i * 0.07,
  duration: 0.6,
  ease: [0.22, 1, 0.36, 1] as const,
})

export function HeroSection() {
  return (
    <section
      id="hero"
      className="noise-overlay relative flex min-h-screen items-center overflow-hidden bg-background pt-16"
    >
      {/* Aurora gradient orbs — slowly drifting colored blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-[10%] -top-[20%] size-[clamp(300px,50vw,600px)] rounded-full bg-[oklch(0.45_0.18_230/0.15)] blur-[100px] motion-safe:animate-[aurora-1_15s_ease-in-out_infinite]" />
        <div className="absolute -right-[5%] top-[10%] size-[clamp(250px,40vw,500px)] rounded-full bg-[oklch(0.40_0.15_280/0.12)] blur-[120px] motion-safe:animate-[aurora-2_20s_ease-in-out_infinite]" />
        <div className="absolute -bottom-[15%] left-[30%] size-[clamp(350px,45vw,650px)] rounded-full bg-[oklch(0.35_0.12_200/0.10)] blur-[100px] motion-safe:animate-[aurora-3_18s_ease-in-out_infinite]" />
      </div>

      {/* Waveform background — enhanced opacity */}
      <WaveformVisual className="opacity-[0.12]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Headline — word-by-word blur-to-focus reveal */}
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            {HEADLINE_WORDS.map((word, i) => (
              <motion.span
                key={`hero-${String(i)}`}
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={wordTransition(i)}
                className="mr-[0.25em] inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            Notre agent vocal IA répond 24/7, qualifie vos prospects et prend vos rendez-vous — en
            moins de 60 secondes.
          </motion.p>

          {/* Phone callback CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-10 max-w-md"
          >
            <PhoneCallbackCTA />
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Badge
              variant="secondary"
              className="gap-1.5 border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
            >
              <span aria-hidden="true">🇫🇷</span> Hébergé en France
            </Badge>
            <Badge
              variant="secondary"
              className="gap-1.5 border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
            >
              <span aria-hidden="true">⚡</span> Opérationnel en 48h
            </Badge>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/40">
            Découvrir
          </span>
          <div className="h-8 w-px bg-gradient-to-b from-muted-foreground/30 to-transparent motion-safe:animate-[scroll-bounce_2s_ease-in-out_infinite]" />
        </div>
      </motion.div>
    </section>
  )
}
