import { Bell, Calendar, Phone, Users } from 'lucide-react'
import { Reveal } from './Reveal'

const CATEGORIES = [
  {
    icon: Phone,
    title: 'Téléphonie',
    items: ['SIP', 'Twilio', 'Numéros français natifs'],
  },
  {
    icon: Users,
    title: 'CRM',
    items: ['Salesforce', 'HubSpot', 'Pipedrive', 'Webhook générique'],
  },
  {
    icon: Calendar,
    title: 'Agenda',
    items: ['Google Calendar', 'Outlook'],
  },
  {
    icon: Bell,
    title: 'Notifications',
    items: ['SMS', 'Email', 'Webhook'],
  },
] as const

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-[family-name:var(--font-display)] text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            S'intègre à vos outils existants
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
            Connectez Sablia Vox à votre stack en quelques clics. Aucun développement requis.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category, i) => {
            const Icon = category.icon
            return (
              <Reveal key={category.title} delay={i * 0.1}>
                <div className="text-center">
                  <div className="mx-auto mb-4 inline-flex rounded-xl bg-primary/[0.08] p-4 ring-1 ring-primary/10">
                    <Icon className="size-7 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{category.title}</h3>
                  <ul className="mt-3 space-y-2">
                    {category.items.map((item) => (
                      <li key={item} className="text-sm text-muted-foreground">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
