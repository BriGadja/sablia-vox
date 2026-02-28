'use client'

import {
  ArrowLeftRight,
  Brain,
  Check,
  FileText,
  Mic,
  Monitor,
  Moon,
  Phone,
  PhoneCall,
  RefreshCw,
  Target,
  Zap,
} from 'lucide-react'
import Image from 'next/image'

// Types pour distinguer les catégories avec logos vs capabilities
type LogoItem = { name: string; logo: string }
type CapabilityItem = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

type CategoryWithLogos = {
  id: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  borderColor: string
  type: 'logos'
  items: LogoItem[]
}

type CategoryWithCapabilities = {
  id: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  borderColor: string
  type: 'capabilities'
  capabilities: CapabilityItem[]
}

type IntegrationCategory = CategoryWithLogos | CategoryWithCapabilities

const integrationCategories: IntegrationCategory[] = [
  {
    id: 'logiciels',
    title: 'Logiciels',
    subtitle: 'CRM & Calendriers',
    icon: Monitor,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    type: 'logos',
    items: [
      { name: 'Pipedrive', logo: '/logos/pipedrive-white.svg' },
      { name: 'HubSpot', logo: '/logos/hubspot-white.svg' },
      { name: 'Salesforce', logo: '/logos/salesforce-white.svg' },
      { name: 'Gmail', logo: '/logos/gmail-white.svg' },
      { name: 'Google Calendar', logo: '/logos/google-calendar-white.svg' },
      { name: 'Outlook', logo: '/logos/outlook-white.svg' },
    ],
  },
  {
    id: 'telephonie',
    title: 'Téléphonie',
    subtitle: 'Infrastructure vocale',
    icon: Phone,
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    type: 'capabilities',
    capabilities: [
      {
        icon: PhoneCall,
        title: 'Réponse sur vos numéros existants',
        description: 'Pas besoin de changer de ligne',
      },
      {
        icon: ArrowLeftRight,
        title: "Transfert d'appel vers vos équipes",
        description: 'En temps réel si nécessaire',
      },
      {
        icon: Moon,
        title: 'Disponibilité 24/7',
        description: 'Même la nuit et les week-ends',
      },
      {
        icon: FileText,
        title: 'Enregistrement & transcription',
        description: 'De chaque conversation',
      },
    ],
  },
  {
    id: 'ia',
    title: 'IA',
    subtitle: 'Intelligence vocale',
    icon: Brain,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    type: 'capabilities',
    capabilities: [
      {
        icon: Target,
        title: 'Compréhension contextuelle avancée',
        description: 'Comprend le sens, pas juste les mots',
      },
      {
        icon: Mic,
        title: 'Voix naturelles haute fidélité',
        description: 'Conversation fluide et humaine',
      },
      {
        icon: Zap,
        title: 'Temps de réponse moyen < 1 seconde',
        description: 'Dialogue sans latence',
      },
      {
        icon: RefreshCw,
        title: 'Évolution continue du produit',
        description: 'Améliorations régulières incluses',
      },
    ],
  },
]

export function IntegrationsTriple() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            On s&apos;occupe de{' '}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              tout
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            VoIPIA s&apos;intègre avec vos outils existants pour une mise en place sans friction
          </p>
        </div>

        {/* Three columns */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {integrationCategories.map((category) => (
            <div
              key={category.id}
              className={`rounded-2xl ${category.bgColor} border ${category.borderColor} overflow-hidden`}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center mb-4`}
                >
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h3
                  className={`text-2xl font-bold bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}
                >
                  {category.title}
                </h3>
                <p className="text-gray-400">{category.subtitle}</p>
              </div>

              {/* Content - Logos OR Capabilities */}
              <div className="p-6">
                {category.type === 'logos' ? (
                  /* Logos grid pour CRM/Calendriers */
                  <div className="grid grid-cols-3 gap-3">
                    {category.items.map((item) => (
                      <div
                        key={item.name}
                        className="aspect-square rounded-lg bg-white/5 border border-white/5 flex items-center justify-center p-2 hover:bg-white/10 transition-colors"
                        title={item.name}
                      >
                        <Image
                          src={item.logo}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="object-contain opacity-70 hover:opacity-100 transition-opacity"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Capabilities list pour Téléphonie et IA */
                  <div className="space-y-4">
                    {category.capabilities.map((capability, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <capability.icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{capability.title}</p>
                          <p className="text-xs text-gray-500">{capability.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Vous utilisez un autre outil ? Contactez-nous, nous nous adaptons à votre stack.
          </p>
        </div>
      </div>
    </section>
  )
}
