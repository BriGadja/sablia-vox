import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/landingv2/', // Temporaire, sera retiré après migration
        ],
      },
    ],
    sitemap: 'https://vox.sablia.io/sitemap.xml',
  }
}
