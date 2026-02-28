// Types pour les agents
export type AgentType = 'louis' | 'arthur' | 'alexandra'

export interface Agent {
  id: AgentType
  name: string
  displayName: string
  tagline: string
  description: string
  color: {
    primary: string
    secondary: string
    gradient: string
  }
  icon: string
  badge: string
}

// Types pour les sections
export interface HeroSection {
  title: string
  subtitle: string
  description: string
  ctaPrimary: CTAButton
  ctaSecondary?: CTAButton
}

export interface CTAButton {
  text: string
  label?: string // Alias for text
  action: 'calendar' | 'audio' | 'link' | 'modal'
  href?: string
  variant?: 'primary' | 'secondary' | 'outline'
}

export interface UseCaseCard {
  title: string
  description: string
  icon: string
}

export interface BenefitMetric {
  label: string
  value: string
  icon: string
}

export interface TestimonialData {
  quote: string
  author: string
  role: string
  company: string
  metrics?: {
    label: string
    value: string
  }[]
}

export interface PricingTier {
  agentType: AgentType
  name: string
  description?: string
  price: number
  currency: 'EUR' | 'USD'
  period: 'month' | 'year'
  color?: {
    primary: string
    secondary: string
    gradient: string
  }
  included: string[]
  consumption: {
    calls: number
    sms: number
    emails: number
  }
  example?: {
    volume: string
    breakdown: {
      subscription: number
      calls: number
      sms: number
      total: number
    }
  }
  badge?: string
  cta: CTAButton
}

export interface FAQItem {
  question: string
  answer: string
  icon?: string
}

export interface IntegrationLogo {
  name: string
  logo: string
  category:
    | 'crm'
    | 'calendar'
    | 'automation'
    | 'communication'
    | 'ai'
    | 'storage'
    | 'productivity'
    | 'dev'
}
