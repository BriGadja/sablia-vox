import { useCallback, useEffect, useState } from 'react'
import type { ChatSession } from '@/types/chatbot'

const STORAGE_KEY = 'sablia-chatbot-session'

export function useSessionStorage() {
  const [session, setSession] = useState<ChatSession | null>(null)

  // Load session from storage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedSession = JSON.parse(stored)
        // Convert timestamp strings back to Date objects
        parsedSession.startedAt = new Date(parsedSession.startedAt)
        parsedSession.messages = parsedSession.messages.map((msg: { timestamp: string }) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
        setSession(parsedSession)
      }
    } catch (error) {
      console.warn('Failed to load chatbot session from storage:', error)
    }
  }, [])

  const saveSession = useCallback((newSession: ChatSession) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newSession))
      setSession(newSession)
    } catch (error) {
      console.warn('Failed to save chatbot session to storage:', error)
      setSession(newSession)
    }
  }, [])

  const clearSession = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear chatbot session from storage:', error)
    }
    setSession(null)
  }, [])

  const createSession = useCallback((): ChatSession => {
    const newSession: ChatSession = {
      sessionId: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      messages: [],
      startedAt: new Date(),
      metadata: {
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        chatId: `chat-${Date.now()}`,
      },
    }

    saveSession(newSession)
    return newSession
  }, [saveSession])

  return {
    session,
    saveSession,
    clearSession,
    createSession,
  }
}
