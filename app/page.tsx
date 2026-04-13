import type { Metadata } from 'next'
import { BenefitsSection } from '@/components/landing/BenefitsSection'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { FAQSection } from '@/components/landing/FAQSection'
import { FinalCTA } from '@/components/landing/FinalCTA'
import { Footer } from '@/components/landing/Footer'
import { Header } from '@/components/landing/Header'
import { HeroSection } from '@/components/landing/HeroSection'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { IntegrationsSection } from '@/components/landing/IntegrationsSection'
import { PricingSection } from '@/components/landing/PricingSection'
import { PainAmplification } from '@/components/landing/PainAmplification'
import { SectorUseCases } from '@/components/landing/SectorUseCases'
import { SocialProof } from '@/components/landing/SocialProof'
import { StickyMobileCTA } from '@/components/landing/StickyMobileCTA'
import { getOrganizationSchema, getPricingSectionSchema } from '@/lib/seo/structured-data'

export const metadata: Metadata = {
  title: 'Sablia Vox — Agent Vocal IA pour Entreprises | Disponible 24/7',
  description:
    'Chaque appel manqué est un client perdu. Notre agent vocal IA répond 24/7, qualifie vos prospects et prend vos rendez-vous en moins de 60 secondes. Hébergé en France, RGPD conforme.',
  keywords: [
    'agent vocal IA',
    'agent IA entreprise',
    'rappel automatique leads',
    'standard téléphonique IA',
    'automatisation appels',
    'qualification prospects IA',
    'RGPD conforme',
  ],
  openGraph: {
    title: 'Sablia Vox — Agent Vocal IA pour Entreprises',
    description:
      'Notre agent vocal IA répond 24/7, qualifie vos prospects et prend vos rendez-vous. Zéro appel manqué.',
    url: 'https://vox.sablia.io',
    siteName: 'Sablia Vox',
    images: [
      {
        url: 'https://vox.sablia.io/og-home.png',
        width: 1200,
        height: 630,
        alt: 'Sablia Vox — Agent Vocal IA',
      },
    ],
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sablia Vox — Agent Vocal IA pour Entreprises',
    description:
      'Notre agent vocal IA répond 24/7, qualifie vos prospects et prend vos rendez-vous.',
    images: ['https://vox.sablia.io/og-home.png'],
  },
}

export default function Home() {
  const organizationSchema = getOrganizationSchema()
  const pricingSchema = getPricingSectionSchema()

  return (
    <>
      <Header />
      <main className="overflow-x-hidden">
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: standard JSON-LD pattern for schema.org structured data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD pricing structured data
          dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
        />

        <HeroSection />
        <PainAmplification />
        <BenefitsSection />
        <HowItWorks />
        <SocialProof />
        <SectorUseCases />
        <DashboardPreview />
        <PricingSection />
        <IntegrationsSection />
        <FAQSection />
        <FinalCTA />
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  )
}
