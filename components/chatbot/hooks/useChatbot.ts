import { useCallback, useState } from 'react'
import { chatbotConfig } from '@/lib/constants'
import type { ChatbotState, ChatMessage } from '@/types/chatbot'
import { useSessionStorage } from './useSessionStorage'
import { useWebhook } from './useWebhook'

export function useChatbot() {
  const [state, setState] = useState<ChatbotState>({
    isOpen: false,
    isLoading: false,
    isTyping: false,
    session: null,
    error: null,
  })

  const { sendToWebhook } = useWebhook()
  const { session, saveSession, clearSession, createSession } = useSessionStorage()

  // Initialize session when first opened
  const initializeSession = useCallback(() => {
    if (!session) {
      const newSession = createSession()

      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        type: 'bot',
        content: chatbotConfig.welcomeMessage,
        timestamp: new Date(),
        metadata: {
          agent: 'chatbot-iapreneurs',
          confidence: 1.0,
        },
      }

      newSession.messages.push(welcomeMessage)
      saveSession(newSession)

      setState((prev) => ({ ...prev, session: newSession }))
    } else {
      setState((prev) => ({ ...prev, session }))
    }
  }, [session, createSession, saveSession])

  const toggleChat = useCallback(() => {
    setState((prev) => {
      const newIsOpen = !prev.isOpen
      if (newIsOpen && !prev.session) {
        initializeSession()
      }
      return { ...prev, isOpen: newIsOpen, error: null }
    })
  }, [initializeSession])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!session || state.isLoading) return

      // Clear any previous errors
      setState((prev) => ({ ...prev, error: null, isLoading: true }))

      // Create user message
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        type: 'user',
        content: content.trim(),
        timestamp: new Date(),
      }

      // Add user message to session
      const updatedSession = {
        ...session,
        messages: [...session.messages, userMessage],
      }
      saveSession(updatedSession)
      setState((prev) => ({ ...prev, session: updatedSession }))

      try {
        // Show typing indicator
        setState((prev) => ({ ...prev, isTyping: true }))

        // Send to webhook
        const webhookResponse = await sendToWebhook({
          message: content,
          sessionId: session.sessionId,
          timestamp: new Date().toISOString(),
          metadata: session.metadata,
        })

        // Create bot response message
        const botMessage: ChatMessage = {
          id: `msg-${Date.now()}-bot`,
          type: 'bot',
          content: webhookResponse.response,
          timestamp: new Date(),
          metadata: webhookResponse.metadata,
        }

        // Add bot message to session
        const finalSession = {
          ...updatedSession,
          messages: [...updatedSession.messages, botMessage],
        }
        saveSession(finalSession)

        setState((prev) => ({
          ...prev,
          session: finalSession,
          isLoading: false,
          isTyping: false,
        }))
      } catch (error) {
        console.error('Failed to send message:', error)

        // Create error message
        const errorMessage: ChatMessage = {
          id: `msg-${Date.now()}-error`,
          type: 'bot',
          content: error instanceof Error ? error.message : 'Une erreur est survenue.',
          timestamp: new Date(),
          metadata: {
            error: true,
          },
        }

        const errorSession = {
          ...updatedSession,
          messages: [...updatedSession.messages, errorMessage],
        }
        saveSession(errorSession)

        setState((prev) => ({
          ...prev,
          session: errorSession,
          isLoading: false,
          isTyping: false,
          error: error instanceof Error ? error.message : 'Une erreur est survenue.',
        }))
      }
    },
    [session, state.isLoading, sendToWebhook, saveSession],
  )

  const resetChat = useCallback(() => {
    clearSession()
    setState({
      isOpen: false,
      isLoading: false,
      isTyping: false,
      session: null,
      error: null,
    })
  }, [clearSession])

  return {
    state,
    sendMessage,
    toggleChat,
    resetChat,
    initializeSession,
  }
}
