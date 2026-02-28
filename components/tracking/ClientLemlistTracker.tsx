'use client'

import dynamic from 'next/dynamic'

/**
 * Client-side wrapper for Lemlist Tracking
 *
 * Uses dynamic import with ssr: false to:
 * - Avoid hydration mismatches
 * - Optimize bundle size
 * - Load tracking script only on client side
 *
 * This pattern follows the same approach as ClientChatbot.
 */
const LemlistTracker = dynamic(() => import('./LemlistTracker').then((mod) => mod.LemlistTracker), {
  ssr: false,
  loading: () => null,
})

export default function ClientLemlistTracker() {
  return <LemlistTracker />
}
