export const chatbotConfig = {
  webhookUrl:
    process.env.NEXT_PUBLIC_CHATBOT_WEBHOOK_URL ||
    'https://n8n.sablia.io/webhook/chatbot-iapreneurs',
  welcomeMessage:
    "Bonjour ! Je suis l'assistant IA de Sablia Vox. Comment puis-je vous aider aujourd'hui ?",
  placeholder: 'Écrivez votre message...',
  maxMessages: 100,
  timeoutMs: 10000,
  title: 'Assistant Sablia Vox',
  subtitle: 'Découvrez nos agents IA',
}
