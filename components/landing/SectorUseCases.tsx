import { Briefcase, Building2, Car, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Reveal } from './Reveal'

const SECTORS = [
  {
    icon: Building2,
    title: 'Immobilier',
    scenario:
      'Rappel instantané des leads internet, qualification du projet immobilier, prise de rendez-vous visite.',
    metric: '+42% de rendez-vous',
  },
  {
    icon: Car,
    title: 'Automobile',
    scenario:
      "Suivi des demandes d'essai, relance des devis non convertis, gestion des rappels atelier.",
    metric: '+35% de conversion essais',
  },
  {
    icon: ShieldCheck,
    title: 'Assurance',
    scenario:
      'Accueil téléphonique 24/7, qualification des sinistres, orientation vers le bon interlocuteur.',
    metric: "-60% de temps d'attente",
  },
  {
    icon: Briefcase,
    title: 'Services',
    scenario:
      'Prise de rendez-vous, réactivation des clients dormants, enquête de satisfaction post-prestation.',
    metric: '+28% de satisfaction',
  },
] as const

export function SectorUseCases() {
  return (
    <section id="cas-usage" className="relative bg-card/20 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-[family-name:var(--font-display)] text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Un agent adapté à <span className="text-gradient-blue">votre secteur</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
            Chaque secteur a ses spécificités. Notre IA s'adapte à votre vocabulaire et vos
            processus.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SECTORS.map((sector, i) => {
            const Icon = sector.icon
            return (
              <Reveal key={sector.title} delay={i * 0.1}>
                <div
                  className={cn(
                    'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500',
                    'hover:-translate-y-1 hover:border-primary/20 hover:bg-white/[0.05] hover:shadow-[0_8px_40px_-10px] hover:shadow-primary/10',
                  )}
                >
                  {/* Hover gradient glow */}
                  <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative">
                    <div className="mb-4 inline-flex rounded-xl bg-primary/[0.08] p-3 ring-1 ring-primary/10">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{sector.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {sector.scenario}
                    </p>
                    <p className="mt-4 font-[family-name:var(--font-mono)] text-sm font-bold text-gradient-warm">
                      {sector.metric}
                    </p>
                    <a
                      href="#hero"
                      className="mt-3 inline-flex text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:opacity-100"
                    >
                      Tester maintenant &rarr;
                    </a>
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
