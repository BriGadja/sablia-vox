'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

// Lazy load chatbot widget for performance
const ChatbotWidget = dynamic(() => import('./ChatbotWidget'), {
  ssr: false,
  loading: () => null,
})

// Pages où le chatbot ne doit pas apparaître
const HIDDEN_PATHS = ['/landingv2']

export default function ClientChatbot() {
  const pathname = usePathname()

  // Ne pas afficher le chatbot sur certaines pages
  if (HIDDEN_PATHS.includes(pathname)) {
    return null
  }

  return <ChatbotWidget />
}
