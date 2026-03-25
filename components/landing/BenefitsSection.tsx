import { Bell, Rocket, Target, Zap } from 'lucide-react'

const BENEFITS = [
  {
    icon: Bell,
    title: 'Zéro appels manqués',
    description: 'Votre agent vocal IA répond 24h/24, 7j/7 — même le dimanche à 3h du matin.',
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
    <section id="benefices" className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-display)] text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Ce que Sablia Vox transforme pour vous
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
          Pas une feature de plus. Une transformation business complète.
        </p>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon
            return (
              <div
                key={benefit.title}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-white/[0.08] motion-safe:animate-[fade-in-up_0.5s_ease-out_both]"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
