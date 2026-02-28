'use client'

import { AnimatePresence } from 'framer-motion'
import { ChatbotContextProvider } from '@/contexts/ChatbotContext'
import ChatbotTrigger from './ChatbotTrigger'
import ChatbotWindow from './ChatbotWindow'
import { useChatbot } from './hooks/useChatbot'

function ChatbotContent() {
  const chatbot = useChatbot()

  return (
    <ChatbotContextProvider value={chatbot}>
      <AnimatePresence mode="wait">
        {chatbot.state.isOpen ? <ChatbotWindow key="window" /> : <ChatbotTrigger key="trigger" />}
      </AnimatePresence>
    </ChatbotContextProvider>
  )
}

export default function ChatbotWidget() {
  return (
    <div className="sablia-chatbot-widget">
      <ChatbotContent />
    </div>
  )
}
