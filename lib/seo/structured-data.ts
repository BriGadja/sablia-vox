/**
 * Structured Data (JSON-LD) generators for SEO
 * Schema.org types: Organization, Product, FAQPage
 */

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sablia Vox',
    url: 'https://vox.sablia.io',
    logo: 'https://vox.sablia.io/logo.png',
    description: 'Agents IA vocaux pour automatiser le traitement de vos prospects',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'brice@sablia.io',
      contactType: 'Sales',
      availableLanguage: ['fr'],
    },
    sameAs: ['https://www.linkedin.com/company/sablia'],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'FR',
    },
  }
}

export function getProductSchema(templateType: string) {
  const products: Record<string, {
    name: string
    description: string
    url: string
    image: string
    price: string
    features: string[]
  }> = {
    setter: {
      name: 'Setter - Agent IA de Prise de Rendez-vous',
      description:
        'Agent IA vocal qui rappelle vos leads en moins de 60 secondes, 24/7. Qualification automatique et prise de rendez-vous.',
      url: 'https://vox.sablia.io/tester-nos-agents',
      image: 'https://vox.sablia.io/og-image.jpg',
      price: '190',
      features: [
        'Rappel en moins de 60 secondes',
        '+72% taux de contact',
        'x3 rendez-vous qualifiés',
        'Déploiement en 5 jours',
      ],
    },
    secretary: {
      name: 'Secrétaire - Agent IA d\'Accueil Téléphonique 24/7',
      description:
        'Agent IA vocal qui répond à tous vos appels entrants en moins de 3 sonneries, 24/7.',
      url: 'https://vox.sablia.io/tester-nos-agents',
      image: 'https://vox.sablia.io/og-image.jpg',
      price: '290',
      features: [
        '100% taux de réponse',
        'Réponse en <3 sonneries',
        'Disponibilité 24/7',
        '+45% satisfaction client',
      ],
    },
    transfer: {
      name: 'Transfert - Agent IA de Qualification et Transfert',
      description:
        'Agent IA vocal qui qualifie et transfère vos prospects vers le bon interlocuteur.',
      url: 'https://vox.sablia.io/tester-nos-agents',
      image: 'https://vox.sablia.io/og-image.jpg',
      price: '490',
      features: [
        'Qualification automatique',
        'Transfert intelligent',
        'Multi-canaux (appel, SMS, email)',
        'Disponibilité 24/7',
      ],
    },
  }

  const product = products[templateType]
  if (!product) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    url: product.url,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: 'Sablia Vox',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        .toISOString()
        .split('T')[0],
      url: product.url,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '50',
      bestRating: '5',
      worstRating: '1',
    },
  }
}

export function getPricingSectionSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Sablia Vox — Agent Vocal IA',
    applicationCategory: 'BusinessApplication',
    browserRequirements: 'HTTPS',
    url: 'https://vox.sablia.io',
    offers: {
      '@type': 'Offer',
      price: '300',
      priceCurrency: 'EUR',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '300',
        priceCurrency: 'EUR',
        billingDuration: 'P1M',
        unitText: 'par agent',
      },
      availability: 'https://schema.org/InStock',
      url: 'https://vox.sablia.io/tester-nos-agents',
    },
  }
}

export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Helper to safely stringify JSON-LD
 */
export function jsonLdScriptProps(data: object) {
  return {
    type: 'application/ld+json' as const,
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data),
    },
  }
}
