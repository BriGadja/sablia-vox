'use client'

import { motion } from 'motion/react'
import { MessageCircle } from 'lucide-react'
import { useChatbotContext } from '@/contexts/ChatbotContext'
import { cn } from '@/lib/utils'

export default function ChatbotTrigger() {
  const { toggleChat } = useChatbotContext()

  return (
    <motion.button
      onClick={toggleChat}
      className={cn(
        'sablia-chatbot-trigger',
        'fixed bottom-4 right-4 z-[9999]',
        'w-14 h-14 rounded-full',
        'bg-linear-to-br from-purple-500 to-purple-600',
        'shadow-lg hover:shadow-xl hover:shadow-purple-500/25',
        'flex items-center justify-center',
        'transition-all duration-300 ease-out',
        'group',
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: [
          '0 10px 25px rgba(168, 85, 247, 0.4)',
          '0 10px 35px rgba(168, 85, 247, 0.6)',
          '0 10px 25px rgba(168, 85, 247, 0.4)',
        ],
      }}
      transition={{
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
      aria-label="Ouvrir le chat avec l'assistant Sablia Vox"
      title="Discutez avec notre assistant IA"
    >
      <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-200" />

      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-purple-400/50"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.7, 0, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Notification dot */}
      <motion.div
        className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.button>
  )
}
