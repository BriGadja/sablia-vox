export interface ChatMessage {
  id: string
  type: 'user' | 'bot' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    agent?: string
    confidence?: number
    error?: boolean
  }
}

export interface ChatSession {
  sessionId: string
  messages: ChatMessage[]
  startedAt: Date
  metadata: {
    userAgent: string
    referrer: string
    chatId: string
  }
}

export interface ChatbotState {
  isOpen: boolean
  isLoading: boolean
  isTyping: boolean
  session: ChatSession | null
  error: string | null
}

export interface WebhookPayload {
  message: string
  sessionId: string
  timestamp: string
  metadata: {
    userAgent: string
    referrer: string
    chatId: string
  }
}

export interface WebhookResponse {
  response: string
  type: 'text' | 'typing' | 'error'
  metadata: {
    agent: string
    confidence: number
  }
}

export interface ChatbotConfig {
  webhookUrl: string
  welcomeMessage: string
  placeholder: string
  maxMessages: number
  timeoutMs: number
}
