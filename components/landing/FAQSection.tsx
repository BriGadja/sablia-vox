import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const FAQ_ITEMS = [
  {
    question: 'Où sont hébergées mes données ?',
    answer:
      "Toutes les données sont hébergées en France et dans l'Union Européenne (Paris et Francfort). Nous utilisons des hébergeurs certifiés ISO 27001 avec chiffrement de bout en bout. Vous restez propriétaire de vos données à tout moment.",
  },
  {
    question: 'Comment fonctionne la qualité vocale ?',
    answer:
      "Nos agents utilisent les modèles vocaux les plus avancés (Eleven Labs, Cartesia) avec des variations d'intonation naturelles. La voix s'adapte au contexte de la conversation. Si un prospect demande explicitement s'il parle à un humain, l'agent répond honnêtement.",
  },
  {
    question: 'Quel est le délai de mise en place ?',
    answer:
      '48 heures en moyenne. Jour 1 : configuration et intégration de votre CRM. Jour 2 : personnalisation du script vocal, tests et mise en production avec monitoring. Aucun prérequis technique de votre côté.',
  },
  {
    question: 'Combien ça coûte ?',
    answer:
      "Un abonnement mensuel tout inclus (infrastructure, ligne téléphonique, dashboard, support) plus la consommation réelle (appels, SMS). Pas d'engagement minimum. Contactez-nous pour un devis adapté à votre volume.",
  },
  {
    question: "L'agent peut-il s'adapter à mon vocabulaire métier ?",
    answer:
      'Absolument. Chaque agent est configuré avec le vocabulaire spécifique de votre secteur (immobilier, automobile, assurance, etc.). Les scripts sont personnalisés pour refléter votre ton et vos processus internes.',
  },
  {
    question: "Que se passe-t-il si l'IA ne sait pas répondre ?",
    answer:
      "L'agent reconnaît les questions hors périmètre et propose soit de planifier un rendez-vous avec votre équipe, soit de transférer l'appel en temps réel vers un collaborateur disponible. Aucun appel n'est perdu.",
  },
  {
    question: 'Quelles langues sont supportées ?',
    answer:
      "Le français est notre langue principale avec une qualité vocale native. L'anglais et l'espagnol sont également disponibles. D'autres langues peuvent être ajoutées sur demande.",
  },
  {
    question: "Comment Sablia Vox s'intègre-t-il à mon CRM ?",
    answer:
      "Nous proposons des connecteurs natifs pour Salesforce, HubSpot et Pipedrive. Pour les autres CRM, un webhook générique permet l'intégration en quelques minutes. Toutes les données d'appel (transcription, qualification, rendez-vous) sont synchronisées automatiquement.",
  },
] as const

export function FAQSection() {
  return (
    <section id="faq" className="bg-card/30 py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-display)] text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Questions fréquentes
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-lg text-muted-foreground">
          Tout ce que vous devez savoir avant de démarrer.
        </p>

        <Accordion type="single" collapsible className="mt-12">
          {FAQ_ITEMS.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question} className="border-border">
              <AccordionTrigger className="text-left text-base font-medium text-foreground hover:text-primary [&[data-state=open]]:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
