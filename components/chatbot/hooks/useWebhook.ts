import { useCallback } from 'react'
import { chatbotConfig } from '@/lib/constants'
import type { WebhookPayload, WebhookResponse } from '@/types/chatbot'

export function useWebhook() {
  const sendToWebhook = useCallback(async (payload: WebhookPayload): Promise<WebhookResponse> => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), chatbotConfig.timeoutMs)

    try {
      const response = await fetch(chatbotConfig.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Handle n8n response format and provide fallback structure
      if (typeof data === 'string') {
        return {
          response: data,
          type: 'text' as const,
          metadata: {
            agent: 'chatbot-iapreneurs',
            confidence: 1.0,
          },
        }
      }

      return {
        response: data.response || data.message || "Je n'ai pas pu traiter votre demande.",
        type: data.type || 'text',
        metadata: {
          agent: data.metadata?.agent || 'chatbot-iapreneurs',
          confidence: data.metadata?.confidence || 1.0,
        },
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('La demande a pris trop de temps. Veuillez réessayer.')
      }

      console.error('Webhook error:', error)
      throw new Error('Une erreur est survenue. Veuillez réessayer ou nous contacter directement.')
    } finally {
      clearTimeout(timeout)
    }
  }, [])

  return { sendToWebhook }
}
