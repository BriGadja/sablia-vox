import type { Metadata } from 'next'
import { DM_Sans, Fraunces, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from 'sonner'
import { AuthHashHandler } from '@/components/auth/AuthHashHandler'
import ClientLemlistTracker from '@/components/tracking/ClientLemlistTracker'
import { Providers } from './providers'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sablia Vox - Agents Vocaux IA 24/7',
  description:
    'Transformez vos appels en opportunités avec nos agents vocaux IA. Prise de rendez-vous, accueil téléphonique, transfert d\'appels. Performance garantie 24/7.',
  keywords: [
    'agent vocal IA',
    'intelligence artificielle',
    'prospection téléphonique',
    'CRM',
    'automatisation commerciale',
  ],
  authors: [{ name: 'Sablia Vox', url: 'https://vox.sablia.io' }],
  creator: 'Sablia Vox',
  publisher: 'Sablia Vox',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://vox.sablia.io',
    siteName: 'Sablia Vox',
    title: 'Sablia Vox - Agents Vocaux IA 24/7',
    description:
      'Transformez vos appels en opportunités avec nos agents vocaux IA disponibles 24/7',
  },
  twitter: {
    card: 'summary',
    title: 'Sablia Vox - Agents Vocaux IA 24/7',
    description: 'Transformez vos appels en opportunités avec nos agents vocaux IA',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${fraunces.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <NuqsAdapter>
          <Providers>
            <AuthHashHandler />
            {children}
            <Toaster
              position="top-right"
              theme="dark"
              richColors
              closeButton
              toastOptions={{
                style: {
                  background: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                },
              }}
            />
          </Providers>
        </NuqsAdapter>
        <Analytics />
        <ClientLemlistTracker />
      </body>
    </html>
  )
}
