'use client'

import { AlertCircle, Bot, User } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types/chatbot'

interface ChatbotMessageProps {
  message: ChatMessage
  isLast: boolean
}

export default function ChatbotMessage({ message, isLast }: ChatbotMessageProps) {
  const isUser = message.type === 'user'
  const isError = message.metadata?.error

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: 'easeOut',
        delay: isLast ? 0.1 : 0,
      }}
      className={cn(
        'sablia-chatbot-message',
        'flex gap-3 p-4',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser
            ? 'bg-blue-500'
            : isError
              ? 'bg-red-500/20 border border-red-500/30'
              : 'bg-linear-to-br from-purple-500 to-purple-600',
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4 text-red-400" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          'flex-1 max-w-[75%]',
          isUser ? 'flex flex-col items-end' : 'flex flex-col items-start',
        )}
      >
        {/* Message bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3 shadow-sm',
            'break-words whitespace-pre-wrap',
            isUser
              ? 'bg-blue-500 text-white'
              : isError
                ? 'bg-red-500/10 border border-red-500/20 text-red-200'
                : 'bg-gray-800/50 backdrop-blur-sm border border-white/10 text-gray-100',
          )}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>

        {/* Timestamp and metadata */}
        <div
          className={cn(
            'flex items-center gap-2 mt-1 px-1',
            'text-xs text-gray-500',
            isUser ? 'flex-row-reverse' : 'flex-row',
          )}
        >
          <span>{formatTime(message.timestamp)}</span>
          {message.metadata?.confidence !== undefined && (
            <span className="opacity-70">{Math.round(message.metadata.confidence * 100)}%</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
