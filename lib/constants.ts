/**
 * Outcome groups for v2's 20-value enum
 * Used by OutcomeBreakdown, CallsListClient, CallDetailClient
 */
export const OUTCOME_CONFIG: Record<
  string,
  {
    label: string
    group: 'success' | 'pending' | 'not_reached' | 'negative' | 'error'
    className: string
  }
> = {
  appointment_scheduled: {
    label: 'RDV pris',
    group: 'success',
    className: 'bg-green-500/20 text-green-400',
  },
  transferred: {
    label: 'Transféré',
    group: 'success',
    className: 'bg-green-500/20 text-green-400',
  },
  info_provided: {
    label: 'Info donnée',
    group: 'success',
    className: 'bg-green-500/20 text-green-400',
  },
  question_answered: {
    label: 'Question répondue',
    group: 'success',
    className: 'bg-green-500/20 text-green-400',
  },
  callback_requested: {
    label: 'Rappel demandé',
    group: 'pending',
    className: 'bg-yellow-500/20 text-yellow-400',
  },
  voicemail: {
    label: 'Messagerie',
    group: 'not_reached',
    className: 'bg-gray-500/20 text-gray-400',
  },
  no_answer: {
    label: 'Pas de réponse',
    group: 'not_reached',
    className: 'bg-gray-500/20 text-gray-400',
  },
  busy: { label: 'Occupé', group: 'not_reached', className: 'bg-gray-500/20 text-gray-400' },
  too_short: {
    label: 'Trop court',
    group: 'not_reached',
    className: 'bg-gray-500/20 text-gray-400',
  },
  not_available: {
    label: 'Indisponible',
    group: 'not_reached',
    className: 'bg-gray-500/20 text-gray-400',
  },
  not_interested: {
    label: 'Pas intéressé',
    group: 'negative',
    className: 'bg-red-500/20 text-red-400',
  },
  do_not_call: {
    label: 'Ne pas appeler',
    group: 'negative',
    className: 'bg-red-500/20 text-red-400',
  },
  appointment_refused: {
    label: 'RDV refusé',
    group: 'negative',
    className: 'bg-red-500/20 text-red-400',
  },
  rejected: { label: 'Rejeté', group: 'negative', className: 'bg-red-500/20 text-red-400' },
  call_failed: { label: 'Appel échoué', group: 'error', className: 'bg-red-900/20 text-red-500' },
  invalid_number: {
    label: 'Numéro invalide',
    group: 'error',
    className: 'bg-red-900/20 text-red-500',
  },
  error: { label: 'Erreur', group: 'error', className: 'bg-red-900/20 text-red-500' },
  canceled: { label: 'Annulé', group: 'error', className: 'bg-red-900/20 text-red-500' },
  spam: { label: 'Spam', group: 'error', className: 'bg-red-900/20 text-red-500' },
  wrong_number: {
    label: 'Mauvais numéro',
    group: 'error',
    className: 'bg-red-900/20 text-red-500',
  },
}

export const OUTCOME_GROUP_COLORS: Record<string, string> = {
  success: '#10b981', // emerald
  pending: '#f59e0b', // amber
  not_reached: '#6b7280', // gray
  negative: '#ef4444', // red
  error: '#991b1b', // red-dark
}

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
