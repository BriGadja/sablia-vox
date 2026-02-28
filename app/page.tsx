import type { Metadata } from 'next'
import { CustomDevelopment } from '@/components/landing/CustomDevelopment'
import { DashboardShowcase } from '@/components/landing/DashboardShowcase'
import { FAQAccordion } from '@/components/landing/FAQAccordion'
import { FloatingCTA } from '@/components/landing/FloatingCTA'
import { HeroHomeV2 } from '@/components/landing/HeroHomeV2'
import { HowItWorksV2 } from '@/components/landing/HowItWorksV2'
import { IntegrationsTriple } from '@/components/landing/IntegrationsTriple'
import { SDRComparison } from '@/components/landing/SDRComparison'
import { HeaderV2 } from '@/components/shared/HeaderV2'
import { faqs } from '@/lib/data/faqs'
import { getOrganizationSchema } from '@/lib/seo/structured-data'

export const metadata: Metadata = {
  title: 'Sablia Vox - Agents IA Vocaux | Disponibles 24/7',
  description:
    'Nos agents IA répondent et rappellent 24/7, qualifient vos prospects, prennent vos rendez-vous et répondent aux questions courantes. Zéro appel manqué, zéro interruption.',
  keywords: [
    'agent IA vocal',
    'rappel automatique leads',
    'réception appels IA',
    'automatisation commerciale',
    'prospection IA',
    'standard téléphonique IA',
  ],
  openGraph: {
    title: 'Sablia Vox - Agents IA Vocaux | Disponibles 24/7',
    description:
      'Déléguez le traitement de vos appels à nos agents IA. Zéro appel manqué, zéro interruption pour vos équipes.',
    url: 'https://vox.sablia.io',
    siteName: 'Sablia Vox',
    images: [
      {
        url: 'https://vox.sablia.io/og-home.png',
        width: 1200,
        height: 630,
        alt: 'Sablia Vox - Agents IA Vocaux',
      },
    ],
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sablia Vox - Agents IA Vocaux',
    description: 'Déléguez le traitement de vos appels à nos agents IA disponibles 24/7',
    images: ['https://vox.sablia.io/og-home.png'],
  },
}

export default function Home() {
  const organizationSchema = getOrganizationSchema()

  return (
    <>
      <HeaderV2 />
      <main className="overflow-x-hidden pt-12">
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />

        {/* 1. Hero Section (USP) - Nouveaux textes, sans cartes agents */}
        <HeroHomeV2 />

        {/* 2. Comment ça fonctionne - 3 blocs Entrée/Traitement/Sortie */}
        <HowItWorksV2 />

        {/* 4. Section Dashboards avec Tabs */}
        <DashboardShowcase />

        {/* 5. Section Intégrations 3 volets */}
        <IntegrationsTriple />

        {/* Conservé: SDR Comparison */}
        <SDRComparison />

        {/* Conservé: Custom Development */}
        <CustomDevelopment />

        {/* 8. FAQ */}
        <div id="faq">
          <FAQAccordion faqs={faqs.home} />
        </div>

        {/* Bouton flottant CTA */}
        <FloatingCTA />
      </main>
    </>
  )
}
