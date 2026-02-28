'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Building, Globe, Loader2, Mail, Phone, X } from 'lucide-react'
import type React from 'react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CTAPopupFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface FormData {
  firstName: string
  lastName: string
  company: string
  website: string
  email: string
  phone: string
  countryCode: string
}

interface FormFieldProps {
  label: string
  required?: boolean
  icon?: React.ReactNode
  helperText?: string
  children: React.ReactNode
}

const FormField: React.FC<FormFieldProps> = ({ label, required, icon, helperText, children }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-white/90">
      {icon && <span className="text-white/60">{icon}</span>}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {helperText && <p className="text-xs text-white/50 italic">{helperText}</p>}
  </div>
)

const COUNTRY_CODES = [
  { value: '+33', label: '🇫🇷 +33', flag: '🇫🇷' },
  { value: '+1', label: '🇺🇸 +1', flag: '🇺🇸' },
  { value: '+44', label: '🇬🇧 +44', flag: '🇬🇧' },
  { value: '+32', label: '🇧🇪 +32', flag: '🇧🇪' },
  { value: '+41', label: '🇨🇭 +41', flag: '🇨🇭' },
]

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Normalise l'URL en ajoutant https:// si manquant
const normalizeWebsite = (url: string): string => {
  let normalized = url.trim()

  // Si pas de protocole, ajouter https://
  if (normalized && !normalized.match(/^https?:\/\//i)) {
    normalized = `https://${normalized}`
  }

  return normalized
}

// Valide qu'une URL a un format domaine.extension minimum
const isValidWebsite = (url: string): boolean => {
  if (!url.trim()) return false
  const normalized = normalizeWebsite(url)
  // Vérifie domaine.extension minimum (ex: example.com, www.example.fr)
  return /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(normalized)
}

// Normalise un numéro de téléphone français
const normalizeFrenchPhone = (phone: string): string => {
  // Supprimer tous les espaces, points, tirets, parenthèses
  let cleaned = phone.replace(/[\s.\-()]/g, '')

  // Cas 1: +33 6 XX XX XX XX → 06XXXXXXXX
  if (cleaned.startsWith('+33')) {
    cleaned = '0' + cleaned.substring(3)
  }

  // Cas 2: 0033 6 XX XX XX XX → 06XXXXXXXX
  if (cleaned.startsWith('0033')) {
    cleaned = '0' + cleaned.substring(4)
  }

  // Cas 3: 336XXXXXXXX → 06XXXXXXXX (11 chiffres commençant par 33)
  if (cleaned.startsWith('33') && cleaned.length === 11) {
    cleaned = '0' + cleaned.substring(2)
  }

  return cleaned
}

// Valide qu'un numéro est un téléphone français valide (10 chiffres commençant par 0)
const isValidFrenchPhone = (phone: string): boolean => {
  if (!phone.trim()) return false
  const normalized = normalizeFrenchPhone(phone)

  // Doit être exactement 10 chiffres commençant par 0
  // Mobiles: 06, 07 / Fixes: 01, 02, 03, 04, 05, 09
  return /^0[1-9]\d{8}$/.test(normalized)
}

const validateForm = (data: FormData): boolean => {
  if (!data.firstName.trim()) return false
  if (!data.lastName.trim()) return false
  if (!data.company.trim()) return false
  if (!isValidWebsite(data.website)) return false
  if (!EMAIL_PATTERN.test(data.email)) return false
  if (!isValidFrenchPhone(data.phone)) return false
  return true
}

const CTAPopupForm: React.FC<CTAPopupFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    company: '',
    website: '',
    email: '',
    phone: '',
    countryCode: '+33',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null) // Clear error on change
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm(formData)) {
      setError('Veuillez remplir tous les champs correctement.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const normalizedWebsite = normalizeWebsite(formData.website.trim())
      const normalizedPhone = normalizeFrenchPhone(formData.phone)
      // Format final: +33648057431 (sans le 0 initial)
      const fullPhone = `${formData.countryCode}${normalizedPhone.substring(1)}`

      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        company: formData.company.trim(),
        website: normalizedWebsite,
        email: formData.email.trim().toLowerCase(),
        phone: fullPhone,
        source: 'landing_cta',
        timestamp: new Date().toISOString(),
      }

      const response = await fetch('https://n8n.sablia.io/webhook/voipia_louis_from_site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi")
      }

      // Success
      onClose()
      onSuccess?.()

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        company: '',
        website: '',
        email: '',
        phone: '',
        countryCode: '+33',
      })
    } catch (err) {
      console.error('Erreur soumission:', err)
      setError('Une erreur est survenue. Veuillez réessayer ou nous contacter à brice@sablia.io')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = validateForm(formData)

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
                  🎙️ Testez votre futur Agent Vocal IA
                </h2>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                {/* Intro Text */}
                <div className="text-white/80 space-y-3 text-sm md:text-base">
                  <p>
                    Testez notre agent vocal intelligent, capable de rappeler vos leads entrants, de
                    les qualifier et de prendre des rendez-vous à votre place, 7j/7, en toute
                    autonomie.
                  </p>
                  <p className="font-medium">Laissez vos coordonnées ci-dessous :</p>
                  <p className="flex items-start gap-2">
                    <span>👉</span>
                    <span>
                      Notre agent vous appellera dans les 30 prochaines secondes pour une
                      démonstration automatique.
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span>👉</span>
                    <span>
                      Vous pourrez ensuite réserver un créneau avec Rémi (Co-Fondateur VoIPIA) pour
                      parler de son implémentation dans votre organisation.
                    </span>
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Name Fields - Side by Side on Desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Prénom" required>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      placeholder="Jean"
                      required
                      minLength={2}
                      maxLength={50}
                      className={cn(
                        'w-full px-4 py-2 bg-black/30 border border-white/10',
                        'rounded-lg text-white placeholder-white/40',
                        'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
                        'transition-colors',
                      )}
                    />
                  </FormField>

                  <FormField label="Nom" required>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      placeholder="Michel"
                      required
                      minLength={2}
                      maxLength={50}
                      className={cn(
                        'w-full px-4 py-2 bg-black/30 border border-white/10',
                        'rounded-lg text-white placeholder-white/40',
                        'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
                        'transition-colors',
                      )}
                    />
                  </FormField>
                </div>

                {/* Company */}
                <FormField
                  label="Nom de votre entreprise"
                  icon={<Building className="w-4 h-4" />}
                  required
                >
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    placeholder="Google"
                    required
                    minLength={2}
                    maxLength={100}
                    className={cn(
                      'w-full px-4 py-2 bg-black/30 border border-white/10',
                      'rounded-lg text-white placeholder-white/40',
                      'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
                      'transition-colors',
                    )}
                  />
                </FormField>

                {/* Website */}
                <FormField
                  label="Site Web de l'entreprise"
                  icon={<Globe className="w-4 h-4" />}
                  required
                  helperText="Vous pouvez entrer simplement example.com (le https:// sera ajouté automatiquement)"
                >
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="example.com"
                    required
                    className={cn(
                      'w-full px-4 py-2 bg-black/30 border border-white/10',
                      'rounded-lg text-white placeholder-white/40',
                      'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
                      'transition-colors',
                    )}
                  />
                </FormField>

                {/* Email */}
                <FormField
                  label="Email professionnel"
                  icon={<Mail className="w-4 h-4" />}
                  required
                  helperText="Pour recevoir un récap de la démo et les infos utiles par email"
                >
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="jean.michel@google.com"
                    required
                    className={cn(
                      'w-full px-4 py-2 bg-black/30 border border-white/10',
                      'rounded-lg text-white placeholder-white/40',
                      'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
                      'transition-colors',
                    )}
                  />
                </FormField>

                {/* Phone */}
                <FormField
                  label="Numéro de téléphone"
                  icon={<Phone className="w-4 h-4" />}
                  required
                  helperText="Pour recevoir l'appel de notre agent"
                >
                  <div className="flex gap-2">
                    <select
                      value={formData.countryCode}
                      onChange={(e) => handleChange('countryCode', e.target.value)}
                      className={cn(
                        'w-28 px-3 py-2 bg-black/30 border border-white/10',
                        'rounded-lg text-white',
                        'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
                        'transition-colors appearance-none cursor-pointer',
                      )}
                    >
                      {COUNTRY_CODES.map((country) => (
                        <option
                          key={country.value}
                          value={country.value}
                          className="bg-gray-900 text-white"
                        >
                          {country.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="06 12 34 56 78"
                      required
                      className={cn(
                        'flex-1 px-4 py-2 bg-black/30 border border-white/10',
                        'rounded-lg text-white placeholder-white/40',
                        'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
                        'transition-colors',
                      )}
                    />
                  </div>
                </FormField>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className={cn(
                    'w-full py-3 px-6 rounded-xl font-semibold',
                    'bg-gradient-to-r from-violet-600 to-purple-600',
                    'text-white text-lg',
                    'transition-all duration-300',
                    'flex items-center justify-center gap-2',
                    isFormValid &&
                      !isSubmitting &&
                      'hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/40',
                    (isSubmitting || !isFormValid) && 'opacity-60 cursor-not-allowed',
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    'Lancer la démonstration ✨'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CTAPopupForm
