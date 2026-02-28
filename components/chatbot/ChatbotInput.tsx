'use client'

import { motion } from 'framer-motion'
import { Loader2, Send } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useChatbotContext } from '@/contexts/ChatbotContext'
import { chatbotConfig } from '@/lib/constants'
import { cn } from '@/lib/utils'

export default function ChatbotInput() {
  const [message, setMessage] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { state, sendMessage } = useChatbotContext()

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      const trimmedMessage = message.trim()
      if (!trimmedMessage || state.isLoading) return

      setMessage('')

      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'
      }

      try {
        await sendMessage(trimmedMessage)
      } catch (error) {
        console.error('Failed to send message:', error)
      }
    },
    [message, state.isLoading, sendMessage],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit(e as any)
      }
    },
    [handleSubmit],
  )

  // Auto-resize textarea
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Auto-resize
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px'
  }, [])

  const canSend = message.trim().length > 0 && !state.isLoading

  return (
    <div
      className={cn(
        'sablia-chatbot-input',
        'border-t border-white/10 p-4',
        'bg-gray-900/50 backdrop-blur-sm',
      )}
    >
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        {/* Input field */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={state.isLoading ? 'Envoi en cours...' : chatbotConfig.placeholder}
            disabled={state.isLoading}
            rows={1}
            className={cn(
              'w-full px-4 py-3 pr-12',
              'bg-black/20 border border-white/20 rounded-2xl',
              'text-white text-sm placeholder-gray-400',
              'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
              'transition-all duration-200',
              'resize-none scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'max-h-[100px] overflow-y-auto',
            )}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#4B5563 transparent',
            }}
            maxLength={1000}
          />

          {/* Character count */}
          {message.length > 800 && (
            <div className="absolute bottom-1 right-1 text-xs text-gray-500">
              {message.length}/1000
            </div>
          )}
        </div>

        {/* Send button */}
        <motion.button
          type="submit"
          disabled={!canSend}
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full',
            'flex items-center justify-center',
            'transition-all duration-200',
            canSend
              ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg hover:shadow-purple-500/25'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed',
          )}
          whileHover={canSend ? { scale: 1.05 } : {}}
          whileTap={canSend ? { scale: 0.95 } : {}}
          aria-label="Envoyer le message"
        >
          {state.isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </motion.button>
      </form>

      {/* Error message */}
      {state.error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
        >
          {state.error}
        </motion.div>
      )}

      {/* Hints */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Appuyez sur Entrée pour envoyer • Maj+Entrée pour une nouvelle ligne
      </div>
    </div>
  )
}
