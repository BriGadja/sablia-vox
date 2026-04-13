import { BarChart3, Calendar, PhoneCall } from 'lucide-react'
import { Reveal } from './Reveal'

const ANNOTATIONS = [
  {
    icon: BarChart3,
    label: 'KPIs temps réel',
    description: 'Appels du jour, taux de réponse, rendez-vous pris',
    position: 'left-4 top-8 sm:left-8 sm:top-12' as const,
  },
  {
    icon: PhoneCall,
    label: "Détail d'un appel",
    description: 'Transcription, émotion détectée, actions prises',
    position: 'right-4 top-1/3 sm:right-8' as const,
  },
  {
    icon: Calendar,
    label: 'Agenda intégré',
    description: 'Rendez-vous calés automatiquement dans votre calendrier',
    position: 'left-4 bottom-8 sm:left-12 sm:bottom-12' as const,
  },
] as const

export function DashboardPreview() {
  return (
    <section id="dashboard" className="section-divider py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-[family-name:var(--font-display)] text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Suivez chaque appel en temps réel
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
            Un tableau de bord complet pour piloter votre activité vocale.
          </p>
        </Reveal>

        {/* Dashboard mockup with shine effect */}
        <Reveal delay={0.15}>
          <div className="group relative mt-12 overflow-hidden rounded-2xl border border-white/[0.06]">
            {/* Shine sweep on hover */}
            <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
              <div className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-safe:group-hover:animate-[shine-sweep_1.5s_ease-in-out_once]" />
            </div>

            {/* Gradient background simulating a dashboard */}
            <div className="aspect-[16/9] w-full bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-10">
              {/* Fake dashboard grid */}
              <div className="grid h-full grid-cols-1 sm:grid-cols-3 gap-4 opacity-40">
                {/* Top row: 3 metric cards */}
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="h-3 w-16 rounded bg-primary/30" />
                  <div className="mt-3 h-8 w-24 rounded bg-primary/20" />
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="h-3 w-20 rounded bg-accent/30" />
                  <div className="mt-3 h-8 w-20 rounded bg-accent/20" />
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="h-3 w-14 rounded bg-primary/30" />
                  <div className="mt-3 h-8 w-28 rounded bg-primary/20" />
                </div>
                {/* Bottom: chart area */}
                <div className="col-span-2 rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="flex h-full items-end gap-2">
                    {[40, 65, 55, 80, 70, 90, 75, 85, 60, 95].map((h) => (
                      <div
                        key={h}
                        className="flex-1 rounded-t bg-primary/25"
                        style={{ height: `${String(h)}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-primary/40" />
                        <div className="h-2 flex-1 rounded bg-white/10" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Glassmorphism annotation overlays */}
            {ANNOTATIONS.map((annotation) => {
              const Icon = annotation.icon
              return (
                <div
                  key={annotation.label}
                  className={`absolute ${annotation.position} max-w-[200px] rounded-xl border border-white/10 bg-white/[0.06] p-3 backdrop-blur-xl`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      {annotation.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
                    {annotation.description}
                  </p>
                </div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
