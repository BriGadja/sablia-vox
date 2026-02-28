'use client'

import { createContext, useContext } from 'react'
import type { ChatbotState } from '@/types/chatbot'

interface ChatbotContextType {
  state: ChatbotState
  sendMessage: (message: string) => Promise<void>
  toggleChat: () => void
  resetChat: () => void
  initializeSession: () => void
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

export function useChatbotContext() {
  const context = useContext(ChatbotContext)
  if (context === undefined) {
    throw new Error('useChatbotContext must be used within a ChatbotProvider')
  }
  return context
}

export const ChatbotContextProvider = ChatbotContext.Provider
