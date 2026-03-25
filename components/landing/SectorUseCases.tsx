import { Briefcase, Building2, Car, ShieldCheck } from 'lucide-react'

const SECTORS = [
  {
    icon: Building2,
    title: 'Immobilier',
    scenario:
      'Rappel instantané des leads internet, qualification du projet immobilier, prise de rendez-vous visite.',
    metric: '+42% de rendez-vous',
    ctaLabel: 'Voir le cas immobilier',
  },
  {
    icon: Car,
    title: 'Automobile',
    scenario:
      "Suivi des demandes d'essai, relance des devis non convertis, gestion des rappels atelier.",
    metric: '+35% de conversion essais',
    ctaLabel: 'Voir le cas auto',
  },
  {
    icon: ShieldCheck,
    title: 'Assurance',
    scenario:
      'Accueil téléphonique 24/7, qualification des sinistres, orientation vers le bon interlocuteur.',
    metric: "-60% de temps d'attente",
    ctaLabel: 'Voir le cas assurance',
  },
  {
    icon: Briefcase,
    title: 'Services',
    scenario:
      'Prise de rendez-vous, réactivation des clients dormants, enquête de satisfaction post-prestation.',
    metric: '+28% de satisfaction',
    ctaLabel: 'Voir le cas services',
  },
] as const

export function SectorUseCases() {
  return (
    <section id="cas-usage" className="bg-card/30 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-display)] text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Un agent adapté à votre secteur
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
          Chaque secteur a ses spécificités. Notre IA s'adapte à votre vocabulaire et vos processus.
        </p>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SECTORS.map((sector) => {
            const Icon = sector.icon
            return (
              <div
                key={sector.title}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{sector.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {sector.scenario}
                </p>
                <p className="mt-4 font-[family-name:var(--font-mono)] text-sm font-bold text-accent">
                  {sector.metric}
                </p>
                <a
                  href="#hero"
                  className="mt-3 inline-flex text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Tester maintenant &rarr;
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
