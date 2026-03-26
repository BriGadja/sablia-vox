import { Brain, CalendarCheck, Phone } from 'lucide-react'
import { Reveal } from './Reveal'

const STEPS = [
  {
    number: 1,
    icon: Phone,
    title: 'Un appel arrive',
    description:
      "L'agent vocal IA décroche instantanément les appels entrants, ou rappelle en moins de 60 secondes les leads sortants.",
  },
  {
    number: 2,
    icon: Brain,
    title: "L'IA qualifie",
    description:
      'Conversation naturelle avec des questions adaptées à votre secteur. Prise de rendez-vous automatique dans votre agenda.',
  },
  {
    number: 3,
    icon: CalendarCheck,
    title: 'Vous recevez le résultat',
    description:
      "Notification immédiate avec le résumé de l'appel, le lead qualifié et le rendez-vous confirmé.",
  },
] as const

export function HowItWorks() {
  return (
    <section id="comment-ca-marche" className="relative bg-card/20 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-[family-name:var(--font-display)] text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Comment ça marche
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
            Trois étapes. Aucun effort technique de votre côté.
          </p>
        </Reveal>

        <div className="relative mt-16">
          {/* Desktop connecting gradient line */}
          <div className="absolute inset-x-0 top-[44px] hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block" />

          <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <Reveal key={step.number} delay={i * 0.15}>
                  <div className="relative flex flex-col items-center text-center">
                    {/* Step number with pulse ring */}
                    <div className="relative z-10">
                      <div className="pointer-events-none absolute inset-0 rounded-full bg-primary/20 motion-safe:animate-[pulse-ring_3s_ease-out_infinite]" />
                      <div className="relative flex size-[56px] items-center justify-center rounded-full border-2 border-primary/60 bg-background font-[family-name:var(--font-mono)] text-lg font-bold text-primary shadow-[0_0_20px_-5px] shadow-primary/30">
                        {step.number}
                      </div>
                    </div>

                    {/* Icon with subtle background */}
                    <div className="mt-6 inline-flex rounded-xl bg-primary/[0.08] p-4 ring-1 ring-primary/10">
                      <Icon className="size-8 text-primary" />
                    </div>

                    {/* Text */}
                    <h3 className="mt-4 text-xl font-semibold text-foreground">{step.title}</h3>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
