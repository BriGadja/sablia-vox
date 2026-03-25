import { BarChart3, Calendar, PhoneCall } from 'lucide-react'

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
    <section id="dashboard" className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-display)] text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Suivez chaque appel en temps réel
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
          Un tableau de bord complet pour piloter votre activité vocale.
        </p>

        {/* Dashboard mockup */}
        <div className="relative mt-12 overflow-hidden rounded-2xl border border-border">
          {/* Gradient background simulating a dashboard */}
          <div className="aspect-[16/9] w-full bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-10">
            {/* Fake dashboard grid */}
            <div className="grid h-full grid-cols-3 gap-4 opacity-40">
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
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary/40" />
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
                className={`absolute ${annotation.position} max-w-[200px] rounded-lg border border-white/20 bg-white/10 p-3 backdrop-blur-md`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground">{annotation.label}</span>
                </div>
                <p className="mt-1 text-[11px] leading-tight text-muted-foreground">
                  {annotation.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
