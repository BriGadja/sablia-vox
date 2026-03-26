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

export function getProductSchema(agent: string) {
  const products = {
    louis: {
      name: 'Louis - Agent IA de Rappel Automatique',
      description:
        'Agent IA vocal qui rappelle vos leads en moins de 60 secondes, 24/7. Qualification automatique et prise de rendez-vous.',
      url: 'https://vox.sablia.io/louis',
      image: 'https://vox.sablia.io/og-louis.png',
      price: '190',
      features: [
        'Rappel en moins de 60 secondes',
        '+72% taux de contact',
        'x3 rendez-vous qualifiés',
        'Déploiement en 5 jours',
      ],
    },
    arthur: {
      name: 'Arthur - Agent IA de Réactivation de Bases Dormantes',
      description:
        'Agent IA vocal qui réactive vos bases de prospects dormants et génère +40k€ CA/mois en moyenne.',
      url: 'https://vox.sablia.io/arthur',
      image: 'https://vox.sablia.io/og-arthur.png',
      price: '490',
      features: [
        '+65% taux de réactivation',
        '+40k€ CA/mois en moyenne',
        'Relance automatique 24/7',
        'Multi-canaux (appel, SMS, email)',
      ],
    },
    alexandra: {
      name: "Alexandra - Agent IA de Réception d'Appels 24/7",
      description:
        'Agent IA vocal qui répond à tous vos appels entrants en moins de 3 sonneries, 24/7.',
      url: 'https://vox.sablia.io/alexandra',
      image: 'https://vox.sablia.io/og-alexandra.png',
      price: '290',
      features: [
        '100% taux de réponse',
        'Réponse en <3 sonneries',
        'Disponibilité 24/7',
        '+45% satisfaction client',
      ],
    },
  }

  const product = products[agent as keyof typeof products]

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
