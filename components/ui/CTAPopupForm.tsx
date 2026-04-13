'use client'

import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type React from 'react'
import { useEffect } from 'react'
import {
  CTAErrorMessage,
  CTAFormFields,
  CTAFormIntro,
  CTASubmitButton,
  useCTAForm,
} from '@/components/ui/cta-form'
import { cn } from '@/lib/utils'

interface CTAPopupFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const CTAPopupForm: React.FC<CTAPopupFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const { formData, isSubmitting, error, isFormValid, handleChange, handleSubmit } = useCTAForm({
    source: 'landing_cta',
    includeTimestamp: true,
  })

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e, () => {
      onClose()
      onSuccess?.()
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              className={cn(
                'bg-gray-900/95 backdrop-blur-xl rounded-2xl',
                'border border-white/10 shadow-2xl',
                'max-w-2xl w-full max-h-[90vh] overflow-y-auto',
                'scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent',
              )}
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl p-6 border-b border-white/10 flex justify-between items-start">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {'\u{1F399}\u{FE0F}'} Testez votre futur Agent Vocal IA
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={onSubmit} className="p-6 md:p-8 space-y-6">
                <CTAFormIntro />
                <CTAErrorMessage error={error} />
                <CTAFormFields formData={formData} onChange={handleChange} />
                <CTASubmitButton isFormValid={isFormValid} isSubmitting={isSubmitting} />
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CTAPopupForm
