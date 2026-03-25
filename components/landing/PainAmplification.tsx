'use client'

// 'use client' needed: IntersectionObserver for counter animation on scroll

import { DollarSign, TrendingDown, Users } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

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
            const eased = 1 - (1 - progress) ** 3 // ease-out cubic
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
}

const STATS: StatItem[] = [
  {
    icon: TrendingDown,
    value: 62,
    suffix: '%',
    label: 'des appels en agence immobilière ne sont jamais rappelés',
    color: 'text-destructive',
  },
  {
    icon: DollarSign,
    value: 847,
    prefix: '€',
    label: "coût moyen d'un lead perdu",
    color: 'text-accent',
  },
  {
    icon: Users,
    value: 3200,
    prefix: '€',
    label: "salaire mensuel moyen d'un SDR",
    sublabel: 'vs ~0,50 € par appel IA',
    color: 'text-primary',
  },
]

export function PainAmplification() {
  return (
    <section id="probleme" className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-display)] text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Le coût caché des appels manqués
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
          Chaque appel sans réponse est une opportunité qui disparaît. Voici ce que ça coûte
          vraiment.
        </p>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 inline-flex rounded-lg bg-white/5 p-3">
                  <Icon className={cn('h-6 w-6', stat.color)} />
                </div>
                <div className={cn('text-4xl font-bold', stat.color)}>
                  <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stat.label}</p>
                {stat.sublabel && (
                  <p className="mt-1 text-xs font-medium text-primary">{stat.sublabel}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
