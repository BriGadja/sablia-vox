'use client'

import { Minimize2, RotateCcw, X } from 'lucide-react'
import { motion } from 'motion/react'
import { useChatbotContext } from '@/contexts/ChatbotContext'
import { chatbotConfig } from '@/lib/constants'
import { cn } from '@/lib/utils'
import ChatbotInput from './ChatbotInput'
import ChatbotMessages from './ChatbotMessages'

export default function ChatbotWindow() {
  const { state, toggleChat, resetChat } = useChatbotContext()

  const handleReset = () => {
    if (window.confirm('Êtes-vous sûr de vouloir recommencer la conversation ?')) {
      resetChat()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] md:hidden"
        onClick={toggleChat}
      />

      {/* Chat window */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        transition={{
          type: 'spring',
          damping: 25,
          stiffness: 300,
        }}
        className={cn(
          'sablia-chatbot-window',
          'fixed z-[9999]',
          // Mobile: full screen
          'inset-0 md:inset-auto',
          // Desktop: floating window
          'md:bottom-4 md:right-4 md:w-96 md:h-[600px]',
          // Styling
          'bg-gray-900/95 backdrop-blur-xl',
          'border border-white/10 shadow-2xl',
          'md:rounded-2xl',
          'flex flex-col overflow-hidden',
        )}
        style={{
          maxHeight: 'calc(100vh - 2rem)',
        }}
      >
        {/* Header */}
        <div
          className={cn(
            'sablia-chatbot-header',
            'flex items-center justify-between',
            'p-4 border-b border-white/10',
            'bg-linear-to-r from-purple-500/10 to-blue-500/10',
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">V</span>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">{chatbotConfig.title}</h3>
              <p className="text-gray-400 text-xs">{chatbotConfig.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Reset button */}
            {state.session && state.session.messages.length > 1 && (
              <motion.button
                onClick={handleReset}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Recommencer la conversation"
                title="Recommencer"
              >
                <RotateCcw className="w-4 h-4 text-gray-400 group-hover:text-white" />
              </motion.button>
            )}

            {/* Minimize button (desktop only) */}
            <motion.button
              onClick={toggleChat}
              className="hidden md:block p-2 rounded-lg hover:bg-white/10 transition-colors group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Réduire le chat"
              title="Réduire"
            >
              <Minimize2 className="w-4 h-4 text-gray-400 group-hover:text-white" />
            </motion.button>

            {/* Close button */}
            <motion.button
              onClick={toggleChat}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Fermer le chat"
              title="Fermer"
            >
              <X className="w-4 h-4 text-gray-400 group-hover:text-white" />
            </motion.button>
          </div>
        </div>

        {/* Messages */}
        <ChatbotMessages messages={state.session?.messages || []} isTyping={state.isTyping} />

        {/* Input */}
        <ChatbotInput />

        {/* Connection status indicator */}
        <div className="absolute bottom-2 left-4 flex items-center gap-2">
          <div
            className={cn('w-2 h-2 rounded-full', state.error ? 'bg-red-400' : 'bg-green-400')}
          />
          <span className="text-xs text-gray-500">{state.error ? 'Hors ligne' : 'En ligne'}</span>
        </div>
      </motion.div>
    </>
  )
}
