import { Bell, Rocket, Target, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Reveal } from './Reveal'

const BENEFITS = [
  {
    icon: Bell,
    title: 'Zéro appels manqués',
    description:
      'Votre agent vocal IA répond 24h/24, 7j/7 — même le dimanche à 3h du matin. Plus aucun lead ne tombe dans le vide.',
  },
  {
    icon: Target,
    title: 'Qualification automatique',
    description:
      "L'IA pose les bonnes questions, filtre les leads et prend rendez-vous dans votre agenda.",
  },
  {
    icon: Rocket,
    title: 'Libérez vos équipes',
    description: 'Vos commerciaux se concentrent sur la vente, pas sur les appels répétitifs.',
  },
  {
    icon: Zap,
    title: 'Déploiement en 48h',
    description: 'Opérationnel en 2 jours, pas en 6 mois. Aucun prérequis technique de votre côté.',
  },
] as const

export function BenefitsSection() {
  return (
    <section id="benefices" className="section-divider py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-[family-name:var(--font-display)] text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ce que Sablia Vox <span className="text-gradient-blue">transforme</span> pour vous
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
            Pas une feature de plus. Une transformation business complète.
          </p>
        </Reveal>

        {/* Bento grid: Row 1 = wide + small | Row 2 = small + wide */}
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon
            const isWide = i === 0 || i === 3
            return (
              <Reveal key={benefit.title} delay={i * 0.1}>
                <div
                  className={cn(
                    'group relative h-full overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500',
                    'hover:border-primary/20 hover:bg-white/[0.05] hover:shadow-[0_0_40px_-10px] hover:shadow-primary/10',
                    isWide && 'sm:col-span-2 lg:col-span-2 lg:p-8',
                  )}
                >
                  {/* Gradient glow on hover — top-left corner */}
                  <div className="pointer-events-none absolute -left-20 -top-20 size-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative">
                    <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 ring-1 ring-primary/20">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <h3
                      className={cn(
                        'font-semibold text-foreground',
                        isWide ? 'text-xl' : 'text-lg',
                      )}
                    >
                      {benefit.title}
                    </h3>
                    <p
                      className={cn(
                        'mt-2 leading-relaxed text-muted-foreground',
                        isWide ? 'max-w-lg text-base' : 'text-sm',
                      )}
                    >
                      {benefit.description}
                    </p>
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
