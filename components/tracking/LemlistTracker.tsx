'use client'

import Script from 'next/script'

/**
 * Lemlist Visitor Tracking Component
 *
 * Tracks visitor behavior and enriches prospect data in Lemlist.
 *
 * Features:
 * - Identifies who visits your website
 * - Enriches visitor data (company, position, etc.)
 * - Triggers automated follow-ups based on page visits
 * - Provides engagement scoring for prospects
 *
 * @see https://help.lemlist.com/en/articles/4181822-what-is-lemlist-visitor-tracking
 */
export function LemlistTracker() {
  const lemlistKey = process.env.NEXT_PUBLIC_LEMLIST_KEY
  const lemlistTeam = process.env.NEXT_PUBLIC_LEMLIST_TEAM

  // Don't render if environment variables are missing
  if (!lemlistKey || !lemlistTeam) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'Lemlist tracking disabled: NEXT_PUBLIC_LEMLIST_KEY or NEXT_PUBLIC_LEMLIST_TEAM not configured',
      )
    }
    return null
  }

  const trackingUrl = `https://app.lemlist.com/api/visitors/tracking?k=${lemlistKey}&t=${lemlistTeam}`

  return <Script id="lemlist-tracking" src={trackingUrl} strategy="afterInteractive" />
}
