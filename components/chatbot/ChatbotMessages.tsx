'use client'

import { AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types/chatbot'
import ChatbotMessage from './ChatbotMessage'
import ChatbotTypingIndicator from './ChatbotTypingIndicator'

interface ChatbotMessagesProps {
  messages: ChatMessage[]
  isTyping: boolean
}

export default function ChatbotMessages({ messages, isTyping }: ChatbotMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      })
    }
  }, [messages.length, isTyping])

  // Handle scroll to bottom on container resize
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        })
      }
    })

    resizeObserver.observe(container)
    return () => resizeObserver.disconnect()
  }, [])

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-400">
          <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-purple-400 text-xl">💬</span>
          </div>
          <p className="text-sm">Commencez une conversation</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'sablia-chatbot-messages',
        'flex-1 overflow-y-auto overflow-x-hidden',
        'scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent',
      )}
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#4B5563 transparent',
      }}
    >
      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <ChatbotMessage
              key={message.id}
              message={message}
              isLast={index === messages.length - 1}
            />
          ))}

          {isTyping && (
            <div className="flex gap-3 p-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xs">...</span>
              </div>
              <div className="flex-1">
                <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl inline-block">
                  <ChatbotTypingIndicator />
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll anchor */}
      <div ref={messagesEndRef} className="h-1" />
    </div>
  )
}
