import { Check } from 'lucide-react'
import Link from 'next/link'
import { Reveal } from './Reveal'

const INCLUDED_FEATURES = [
  '100 minutes incluses',
  'Dashboard analytique complet',
  "Auto-guérison de l'agent",
  'Monitoring en temps réel',
  'Notifications SMS',
  'Support dédié',
] as const

const OVERAGE_RATES = [
  { label: 'Dépassement appels', value: '0,27 €/min' },
  { label: 'SMS', value: '0,14 €/SMS' },
] as const

export function PricingSection() {
  return (
    <section id="tarifs" className="section-divider py-24 lg:py-32">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-[family-name:var(--font-display)] text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tarification simple et transparente
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
            Un seul plan, tout inclus. Pas de frais cachés.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-12 max-w-lg rounded-2xl glass-subtle p-8 sm:p-10">
            {/* Price header */}
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-wider text-primary">Par agent</p>
              <div className="mt-3 flex items-baseline justify-center gap-1">
                <span className="font-[family-name:var(--font-display)] text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                  300 €
                </span>
                <span className="text-lg text-muted-foreground">/mois</span>
              </div>
            </div>

            {/* Divider */}
            <div className="my-8 h-px bg-white/10" />

            {/* Features list */}
            <ul className="space-y-3">
              {INCLUDED_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-primary" />
                  <span className="text-sm text-foreground/90">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div className="my-8 h-px bg-white/10" />

            {/* Overage rates */}
            <div className="space-y-2">
              {OVERAGE_RATES.map((rate) => (
                <div key={rate.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{rate.label}</span>
                  <span className="font-medium text-foreground/80">{rate.value}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8">
              <Link
                href="/tester-nos-agents"
                className="flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Réserver une démo
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
