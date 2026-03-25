'use client'

// 'use client' needed: IntersectionObserver for KPI counter animation

import { Clock, Globe, Shield } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/* Animated counter (reusable within this module)                     */
/* ------------------------------------------------------------------ */
function KPICounter({
  target,
  prefix = '',
  suffix = '',
  duration = 2000,
}: {
  target: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const start = performance.now()

          function step(now: number) {
            const progress = Math.min((now - start) / duration, 1)
            const eased = 1 - (1 - progress) ** 3
            setCount(Math.round(eased * target))
            if (progress < 1) requestAnimationFrame(step)
          }

          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration, hasAnimated])

  return (
    <span ref={ref} className="font-[family-name:var(--font-mono)] tabular-nums">
      {prefix}
      {count.toLocaleString('fr-FR')}
      {suffix}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Data                                                               */
/* ------------------------------------------------------------------ */
const KPIS = [
  { value: 50000, suffix: '+', label: 'appels traités', prefix: '' },
  { value: 99.7, suffix: '%', label: 'taux de réponse', prefix: '' },
  { value: 2, suffix: 's', label: 'temps de réponse moyen', prefix: '<' },
  { value: 4.8, suffix: '/5', label: 'satisfaction client', prefix: '' },
] as const

const TESTIMONIALS = [
  {
    quote:
      "Depuis qu'on utilise Sablia Vox, on ne perd plus un seul lead internet le week-end. L'agent rappelle en 30 secondes, nos commerciaux arrivent le lundi avec des rendez-vous déjà calés.",
    author: 'Marie D.',
    role: 'Directrice commerciale',
    company: 'Agence immobilière, Lyon',
  },
  {
    quote:
      "On avait un taux de rappel de 40% sur nos demandes d'essai. Avec l'agent vocal, on est passé à 95%. Et les clients sont impressionnés par la réactivité.",
    author: 'Thomas R.',
    role: 'Responsable après-vente',
    company: 'Concession automobile, Bordeaux',
  },
  {
    quote:
      "Le ROI est immédiat : on a réduit notre temps de traitement des sinistres de 60% et nos assurés ont enfin quelqu'un qui répond à toute heure.",
    author: 'Sophie L.',
    role: 'Gérante',
    company: 'Cabinet de courtage, Nantes',
  },
]

const LOGOS = [
  'Nestenn',
  'Century 21',
  'Orpi',
  'Laforêt',
  'ERA',
  'Guy Hoquet',
  'Stéphane Plaza',
  'IAD',
]

const TRUST_BADGES = [
  { icon: Globe, label: 'Données hébergées en UE' },
  { icon: Shield, label: 'RGPD conforme' },
  { icon: Clock, label: 'Disponible 24/7' },
] as const

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export function SocialProof() {
  return (
    <section id="preuves" className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-display)] text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Des résultats mesurables
        </h2>

        {/* KPI Counters */}
        <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {KPIS.map((kpi) => (
            <div key={kpi.label} className="text-center">
              <div className="text-3xl font-bold text-primary sm:text-4xl">
                <KPICounter
                  target={typeof kpi.value === 'number' ? kpi.value : 0}
                  prefix={kpi.prefix}
                  suffix={kpi.suffix}
                />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <blockquote
              key={t.author}
              className="flex flex-col rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
            >
              <p className="flex-1 text-sm italic leading-relaxed text-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-4 border-t border-white/10 pt-4">
                <p className="text-sm font-semibold text-foreground">{t.author}</p>
                <p className="text-xs text-muted-foreground">
                  {t.role} — {t.company}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>

        {/* Logo band */}
        <div className="relative mt-16 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
          <div className="motion-safe:animate-[logo-scroll_30s_linear_infinite] flex w-max gap-12 py-4">
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <span
                key={`${logo}-copy-${String(i)}`}
                className={cn(
                  'inline-flex h-10 items-center whitespace-nowrap rounded-md border border-border bg-card px-4 text-sm font-medium text-muted-foreground',
                )}
              >
                {logo}
              </span>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {TRUST_BADGES.map((badge) => {
            const Icon = badge.icon
            return (
              <Badge
                key={badge.label}
                variant="secondary"
                className="gap-2 border-border bg-card/60 px-4 py-2 text-sm text-muted-foreground"
              >
                <Icon className="h-4 w-4 text-primary" />
                {badge.label}
              </Badge>
            )
          })}
        </div>
      </div>
    </section>
  )
}
