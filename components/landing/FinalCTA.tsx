import { ContactForm } from './ContactForm'
import { PhoneCallbackCTA } from './PhoneCallbackCTA'
import { Reveal } from './Reveal'

export function FinalCTA() {
  return (
    <section id="contact" className="noise-overlay relative py-24 lg:py-32">
      {/* Gradient mesh background for emphasis */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/4 top-0 size-[500px] rounded-full bg-[oklch(0.40_0.14_230/0.08)] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 size-[400px] rounded-full bg-[oklch(0.35_0.12_280/0.06)] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-[family-name:var(--font-display)] text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Prêt à <span className="text-gradient-warm">transformer</span> vos appels ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
            Testez gratuitement notre agent vocal en 30 secondes, ou contactez-nous pour un
            accompagnement personnalisé.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Phone callback CTA */}
          <Reveal delay={0.1} direction="left">
            <div className="flex flex-col">
              <h3 className="text-xl font-semibold text-foreground">Tester maintenant</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Recevez un appel de démonstration en quelques secondes.
              </p>
              <div className="mt-6 flex-1">
                <PhoneCallbackCTA compact />
              </div>
            </div>
          </Reveal>

          {/* Right: Contact form */}
          <Reveal delay={0.2} direction="right">
            <div className="flex flex-col">
              <h3 className="text-xl font-semibold text-foreground">Nous contacter</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Notre équipe vous recontacte sous 24 heures.
              </p>
              <div className="mt-6 flex-1">
                <ContactForm />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
