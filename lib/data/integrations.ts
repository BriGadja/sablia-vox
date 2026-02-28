import type { IntegrationLogo } from '@/lib/types/landing'

export const integrations: IntegrationLogo[] = [
  // CRM & Sales
  { name: 'Salesforce', logo: '/logos/salesforce-svgrepo-com.svg', category: 'crm' },

  // Calendar & Scheduling
  { name: 'Google Calendar', logo: '/logos/google-calendar-svgrepo-com.svg', category: 'calendar' },
  { name: 'Outlook', logo: '/logos/outlook-logo-svgrepo-com.svg', category: 'calendar' },
  { name: 'Calendly', logo: '/logos/calendly.svg', category: 'calendar' },

  // Google Workspace
  { name: 'Google Drive', logo: '/logos/googledrive.svg', category: 'storage' },
  { name: 'Google Sheets', logo: '/logos/googlesheets.svg', category: 'productivity' },
  { name: 'Google Forms', logo: '/logos/googleforms.svg', category: 'productivity' },

  // Communication
  { name: 'Slack', logo: '/logos/slack.svg', category: 'communication' },

  // Automation & Development
  { name: 'Make', logo: '/logos/make.svg', category: 'automation' },
  { name: 'n8n', logo: '/logos/n8n.svg', category: 'automation' },
  { name: 'GitHub', logo: '/logos/github.svg', category: 'dev' },
  { name: 'Vercel', logo: '/logos/vercel.svg', category: 'dev' },

  // AI & LLMs
  { name: 'OpenAI', logo: '/logos/openai.svg', category: 'ai' },
  { name: 'Anthropic', logo: '/logos/anthropic.svg', category: 'ai' },
  { name: 'Google Gemini', logo: '/logos/googlegemini.svg', category: 'ai' },
  { name: 'Perplexity', logo: '/logos/perplexity.svg', category: 'ai' },
  { name: 'ElevenLabs', logo: '/logos/ElevenLabs_Logo_0.svg', category: 'ai' },

  // Productivity
  { name: 'Notion', logo: '/logos/notion.svg', category: 'productivity' },
]

export const getIntegrationsByCategory = (category: string): IntegrationLogo[] => {
  return integrations.filter((integration) => integration.category === category)
}
