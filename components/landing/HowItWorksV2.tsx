'use client'

import { ArrowRight, CalendarCheck, Cog, PhoneIncoming } from 'lucide-react'

const steps = [
  {
    id: 'entree',
    number: '1',
    title: 'Entrée',
    subtitle: 'Vos opportunités arrivent. VoIPIA les capte immédiatement.',
    icon: PhoneIncoming,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    items: [
      'Un appel entrant arrive (standard, service client, commercial)',
      'Un nouveau lead apparaît dans votre CRM',
      'Un formulaire est rempli (site, pub, landing)',
      'Hors horaires / déjà en ligne : VoIPIA filtre et gère automatiquement',
    ],
  },
  {
    id: 'traitement',
    number: '2',
    title: 'Traitement',
    subtitle: 'Votre agent vocal prend le relais et suit vos règles métier.',
    icon: Cog,
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    items: [
      'Qualification complète : besoins, budget, urgence, projet',
      'Prise de rendez-vous selon vos disponibilités réelles',
      'Répond aux questions fréquentes (produits, délais, prix…)',
      'Relance intelligente (appels + SMS + email) si le prospect ne décroche pas',
    ],
  },
  {
    id: 'sortie',
    number: '3',
    title: 'Sortie',
    subtitle: 'Vous recevez uniquement ce qui compte.',
    icon: CalendarCheck,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    items: [
      'Rendez-vous planifié dans votre agenda (Google, Outlook…)',
      'SMS et email de confirmation automatiques',
      'Mise à jour CRM : statuts, notes, tags, résumé conversationnel',
      'Escalade / transfert humain si lead stratégique ou demande complexe',
    ],
  },
]

export function HowItWorksV2() {
  return (
    <section id="comment-ca-fonctionne" className="py-24 bg-gray-950">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Comment ça fonctionne
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Un processus simple et automatisé pour transformer vos appels en résultats
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Card */}
              <div
                className={`h-full p-6 lg:p-8 rounded-2xl ${step.bgColor} border ${step.borderColor} backdrop-blur-sm text-center`}
              >
                {/* Icon - centré */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-6 mx-auto`}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3
                  className={`text-2xl font-bold mb-2 bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}
                >
                  {step.title}
                </h3>

                {/* Subtitle */}
                <p className="text-gray-300 font-medium mb-6">{step.subtitle}</p>

                {/* Items list */}
                <ul className="space-y-3 text-left">
                  {step.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3 text-sm text-gray-400">
                      <span
                        className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.color} mt-2 flex-shrink-0`}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Arrow connector (mobile) */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-4 md:hidden">
                  <ArrowRight className="w-6 h-6 text-gray-600 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
