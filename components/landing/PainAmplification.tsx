'use client'
// 'use client' needed: IntersectionObserver for counter animation on scroll

import { DollarSign, TrendingDown, Users } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Reveal } from './Reveal'

interface AnimatedCounterProps {
  target: number
  prefix?: string
  suffix?: string
  duration?: number
}

function AnimatedCounter({
  target,
  prefix = '',
  suffix = '',
  duration = 2000,
}: AnimatedCounterProps) {
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

interface StatItem {
  icon: typeof TrendingDown
  value: number
  prefix?: string
  suffix?: string
  label: string
  sublabel?: string
  color: string
  gradientClass: string
}

const STATS: StatItem[] = [
  {
    icon: TrendingDown,
    value: 62,
    suffix: '%',
    label: 'des appels en agence immobilière ne sont jamais rappelés',
    color: 'text-destructive',
    gradientClass: 'from-destructive/20 to-destructive/5',
  },
  {
    icon: DollarSign,
    value: 847,
    prefix: '€',
    label: "coût moyen d'un lead perdu",
    color: 'text-accent',
    gradientClass: 'from-accent/20 to-accent/5',
  },
  {
    icon: Users,
    value: 3200,
    prefix: '€',
    label: "salaire mensuel moyen d'un SDR",
    sublabel: 'vs ~0,50 € par appel IA',
    color: 'text-primary',
    gradientClass: 'from-primary/20 to-primary/5',
  },
]

export function PainAmplification() {
  return (
    <section id="probleme" className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-[family-name:var(--font-display)] text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Le coût caché des <span className="text-gradient-warm">appels manqués</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
            Chaque appel sans réponse est une opportunité qui disparaît. Voici ce que ça coûte
            vraiment.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STATS.map((stat, i) => {
            const Icon = stat.icon
            return (
              <Reveal key={stat.label} delay={i * 0.12}>
                <div className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-500 hover:border-primary/20 hover:shadow-[0_0_40px_-10px] hover:shadow-primary/10">
                  {/* Colored gradient glow on hover */}
                  <div
                    className={cn(
                      'pointer-events-none absolute -right-10 -top-10 size-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100',
                      `bg-gradient-to-br ${stat.gradientClass}`,
                    )}
                  />

                  <div className="relative">
                    <div className="mb-6 inline-flex rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
                      <Icon className={cn('size-6', stat.color)} />
                    </div>
                    <div className={cn('text-5xl font-bold leading-none lg:text-6xl', stat.color)}>
                      <AnimatedCounter
                        target={stat.value}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                      />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {stat.label}
                    </p>
                    {stat.sublabel && (
                      <p className="mt-1.5 text-xs font-semibold text-primary">{stat.sublabel}</p>
                    )}
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
