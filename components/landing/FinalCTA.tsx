import { ContactForm } from './ContactForm'
import { PhoneCallbackCTA } from './PhoneCallbackCTA'

export function FinalCTA() {
  return (
    <section id="contact" className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-display)] text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Prêt à transformer vos appels ?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
          Testez gratuitement notre agent vocal en 30 secondes, ou contactez-nous pour un
          accompagnement personnalisé.
        </p>

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Phone callback CTA */}
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold text-foreground">Tester maintenant</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Recevez un appel de démonstration en quelques secondes.
            </p>
            <div className="mt-6 flex-1">
              <PhoneCallbackCTA compact />
            </div>
          </div>

          {/* Right: Contact form */}
          <div className="flex flex-col">
            <h3 className="text-xl font-semibold text-foreground">Nous contacter</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Notre équipe vous recontacte sous 24 heures.
            </p>
            <div className="mt-6 flex-1">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
