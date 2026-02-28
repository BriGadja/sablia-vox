/**
 * Google Analytics 4 helpers
 * Docs: https://developers.google.com/analytics/devguides/collection/gtagjs
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

/**
 * Track page view
 */
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

/**
 * Track custom event
 */
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string
  category: string
  label?: string
  value?: number
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// ============================================
// Predefined Events for Sablia Vox
// ============================================

/**
 * Track CTA button click
 */
export const trackCTAClick = (ctaName: string, location: string) => {
  event({
    action: 'cta_click',
    category: 'Conversion',
    label: `${ctaName} - ${location}`,
  })
}

/**
 * Track agent page view (for funnel analysis)
 */
export const trackAgentPageView = (agent: 'louis' | 'arthur' | 'alexandra') => {
  event({
    action: 'agent_page_view',
    category: 'Navigation',
    label: agent,
  })
}

/**
 * Track audio demo play
 */
export const trackAudioPlay = (agent: string) => {
  event({
    action: 'audio_play',
    category: 'Engagement',
    label: agent,
  })
}

/**
 * Track quiz interaction
 */
export const trackQuizSelection = (selectedAgent: string) => {
  event({
    action: 'quiz_selection',
    category: 'Engagement',
    label: selectedAgent,
  })
}

/**
 * Track cross-sell click
 */
export const trackCrossSellClick = (fromAgent: string, toAgent: string) => {
  event({
    action: 'cross_sell_click',
    category: 'Navigation',
    label: `${fromAgent} -> ${toAgent}`,
  })
}
