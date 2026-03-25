'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { AnimatePresence, motion } from 'motion/react'
import { Bot, Building2, Clock, MessageSquare, Play, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { AdminCallRow } from '@/lib/types/adminCalls'
import { EMOTION_LABELS, OUTCOME_LABELS } from '@/lib/types/adminCalls'
import { cn } from '@/lib/utils'

interface TranscriptModalProps {
  call: AdminCallRow | null
  isOpen: boolean
  onClose: () => void
}

// Agent type badge colors
const AGENT_COLORS: Record<string, string> = {
  louis: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  arthur: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  alexandra: 'bg-green-500/20 text-green-400 border-green-500/30',
}

// Outcome badge colors
const OUTCOME_COLORS: Record<string, string> = {
  appointment_scheduled: 'bg-green-500/20 text-green-400',
  appointment_refused: 'bg-red-500/20 text-red-400',
  voicemail: 'bg-yellow-500/20 text-yellow-400',
  not_interested: 'bg-gray-500/20 text-gray-400',
  callback_requested: 'bg-blue-500/20 text-blue-400',
  too_short: 'bg-orange-500/20 text-orange-400',
  call_failed: 'bg-red-500/20 text-red-400',
}

export function TranscriptModal({ call, isOpen, onClose }: TranscriptModalProps) {
  const [mounted, setMounted] = useState(false)

  // Mount state for portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!call || !mounted) return null

  // Format duration
  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return '-'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Format contact name
  const contactName =
    [call.first_name, call.last_name].filter(Boolean).join(' ').trim() || 'Contact inconnu'

  // Render modal in a portal to ensure it's positioned relative to viewport
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 9999 }}
            onClick={onClose}
          />

          {/* Modal - using inset + margin auto for perfect centering */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 m-auto flex flex-col bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
            style={{
              zIndex: 10000,
              width: 'min(800px, calc(100vw - 64px))',
              height: 'fit-content',
              maxHeight: 'min(85vh, calc(100vh - 64px))',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <MessageSquare className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Transcript de l'appel</h2>
                  <p className="text-sm text-gray-400">
                    {format(new Date(call.started_at), "EEEE d MMMM yyyy 'à' HH:mm", {
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                title="Fermer (Échap)"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Call metadata */}
            <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Contact */}
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Contact</p>
                    <p className="text-sm text-white">{contactName}</p>
                  </div>
                </div>

                {/* Client */}
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Client</p>
                    <p className="text-sm text-white">{call.client_name}</p>
                  </div>
                </div>

                {/* Agent */}
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Agent</p>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded border capitalize',
                          AGENT_COLORS[call.agent_type_name],
                        )}
                      >
                        {call.agent_type_name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Durée</p>
                    <p className="text-sm text-white">{formatDuration(call.duration_seconds)}</p>
                  </div>
                </div>
              </div>

              {/* Outcome and emotion */}
              <div className="flex items-center gap-3 mt-4">
                {call.outcome && (
                  <span
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded-full',
                      OUTCOME_COLORS[call.outcome] || 'bg-gray-500/20 text-gray-400',
                    )}
                  >
                    {OUTCOME_LABELS[call.outcome as keyof typeof OUTCOME_LABELS] || call.outcome}
                  </span>
                )}
                {call.emotion && (
                  <span className="text-xs text-gray-400">
                    Émotion:{' '}
                    <span className="text-gray-300">
                      {EMOTION_LABELS[call.emotion as keyof typeof EMOTION_LABELS] || call.emotion}
                    </span>
                  </span>
                )}
                {call.recording_url && (
                  <a
                    href={call.recording_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors ml-auto"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Écouter l'enregistrement
                  </a>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Summary */}
              {call.transcript_summary && (
                <div className="px-6 py-4 border-b border-gray-800">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Résumé</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{call.transcript_summary}</p>
                </div>
              )}

              {/* Full transcript */}
              <div className="px-6 py-4">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Transcript complet</h3>
                {call.transcript ? (
                  <div className="bg-gray-800/30 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {call.transcript}
                    </pre>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Aucun transcript disponible pour cet appel.
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-gray-800 bg-gray-800/30">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}
