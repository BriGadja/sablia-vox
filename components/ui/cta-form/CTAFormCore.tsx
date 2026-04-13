'use client'

import { Building, Globe, Loader2, Mail, Phone } from 'lucide-react'
import type React from 'react'
import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'

// ── Types ────────────────────────────────────────────────────────

export interface CTAFormData {
  firstName: string
  lastName: string
  company: string
  website: string
  email: string
  phone: string
  countryCode: string
}

export interface CTAFormOptions {
  /** Identifies the form source in the webhook payload */
  source: string
  /** Whether to include a timestamp in the payload (popup does, static doesn't) */
  includeTimestamp: boolean
}

interface FormFieldProps {
  label: string
  required?: boolean
  icon?: React.ReactNode
  helperText?: string
  children: React.ReactNode
}

// ── Constants ────────────────────────────────────────────────────

const COUNTRY_CODES = [
  { value: '+33', label: '\u{1F1EB}\u{1F1F7} +33' },
  { value: '+1', label: '\u{1F1FA}\u{1F1F8} +1' },
  { value: '+44', label: '\u{1F1EC}\u{1F1E7} +44' },
  { value: '+32', label: '\u{1F1E7}\u{1F1EA} +32' },
  { value: '+41', label: '\u{1F1E8}\u{1F1ED} +41' },
] as const

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const INITIAL_FORM_DATA: CTAFormData = {
  firstName: '',
  lastName: '',
  company: '',
  website: '',
  email: '',
  phone: '',
  countryCode: '+33',
}

const INPUT_CLASS = cn(
  'w-full px-4 py-2 bg-black/30 border border-white/10',
  'rounded-lg text-white placeholder:text-white/30',
  'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
  'transition-colors',
)

// ── Validation helpers ───────────────────────────────────────────

/** Normalise URL by prepending https:// if missing */
function normalizeWebsite(url: string): string {
  const trimmed = url.trim()
  if (trimmed && !trimmed.match(/^https?:\/\//i)) {
    return `https://${trimmed}`
  }
  return trimmed
}

/** Validate that URL has a minimum domain.extension format */
function isValidWebsite(url: string): boolean {
  if (!url.trim()) return false
  const normalized = normalizeWebsite(url)
  return /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/.test(normalized)
}

/** Normalise a French phone number to 10-digit format starting with 0 */
function normalizeFrenchPhone(phone: string): string {
  let cleaned = phone.replace(/[\s.\-()]/g, '')

  if (cleaned.startsWith('+33')) {
    cleaned = `0${cleaned.substring(3)}`
  }
  if (cleaned.startsWith('0033')) {
    cleaned = `0${cleaned.substring(4)}`
  }
  if (cleaned.startsWith('33') && cleaned.length === 11) {
    cleaned = `0${cleaned.substring(2)}`
  }

  return cleaned
}

/** Validate a French phone number (10 digits starting with 0) */
function isValidFrenchPhone(phone: string): boolean {
  if (!phone.trim()) return false
  const normalized = normalizeFrenchPhone(phone)
  return /^0[1-9]\d{8}$/.test(normalized)
}

function validateForm(data: CTAFormData): boolean {
  if (!data.firstName.trim()) return false
  if (!data.lastName.trim()) return false
  if (!data.company.trim()) return false
  if (!isValidWebsite(data.website)) return false
  if (!EMAIL_PATTERN.test(data.email)) return false
  if (!isValidFrenchPhone(data.phone)) return false
  return true
}

// ── FormField component ──────────────────────────────────────────

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  icon,
  helperText,
  children,
}) => (
  <div className="space-y-2">
    {/* biome-ignore lint/a11y/noLabelWithoutControl: children contain the form control */}
    <label className="flex items-center gap-2 text-sm font-medium text-white/90">
      {icon && <span className="text-white/60">{icon}</span>}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {helperText && <p className="text-xs text-white/50 italic">{helperText}</p>}
  </div>
)

// ── useCTAForm hook ──────────────────────────────────────────────

export function useCTAForm(options: CTAFormOptions) {
  const [formData, setFormData] = useState<CTAFormData>(INITIAL_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isFormValid = validateForm(formData)

  const handleChange = useCallback((field: keyof CTAFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }, [])

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA)
    setError(null)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent, onSuccess?: () => void) => {
      e.preventDefault()
      setError(null)

      if (!validateForm(formData)) {
        setError('Veuillez remplir tous les champs correctement.')
        return
      }

      setIsSubmitting(true)

      try {
        const normalizedWebsite = normalizeWebsite(formData.website.trim())
        const normalizedPhone = normalizeFrenchPhone(formData.phone)
        const fullPhone = `${formData.countryCode}${normalizedPhone.substring(1)}`

        const payload: Record<string, string> = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          company: formData.company.trim(),
          website: normalizedWebsite,
          email: formData.email.trim().toLowerCase(),
          phone: fullPhone,
          source: options.source,
        }

        if (options.includeTimestamp) {
          payload.timestamp = new Date().toISOString()
        }

        const response = await fetch(process.env.NEXT_PUBLIC_CTA_WEBHOOK_URL?.toString() ?? '', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error("Erreur lors de l'envoi")
        }

        resetForm()
        onSuccess?.()
      } catch (err) {
        console.error('CTA form submission error:', err)
        setError(
          'Une erreur est survenue. Veuillez r\u00E9essayer ou nous contacter \u00E0 brice@sablia.io',
        )
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, options.source, options.includeTimestamp, resetForm],
  )

  return { formData, isSubmitting, error, isFormValid, handleChange, handleSubmit, resetForm }
}

// ── CTAFormFields component ──────────────────────────────────────

interface CTAFormFieldsProps {
  formData: CTAFormData
  onChange: (field: keyof CTAFormData, value: string) => void
}

export function CTAFormFields({ formData, onChange }: CTAFormFieldsProps) {
  return (
    <>
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Pr\u00E9nom" required>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            placeholder="Jean"
            required
            minLength={2}
            maxLength={50}
            className={INPUT_CLASS}
          />
        </FormField>

        <FormField label="Nom" required>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            placeholder="Michel"
            required
            minLength={2}
            maxLength={50}
            className={INPUT_CLASS}
          />
        </FormField>
      </div>

      {/* Company */}
      <FormField label="Nom de votre entreprise" icon={<Building className="w-4 h-4" />} required>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => onChange('company', e.target.value)}
          placeholder="Google"
          required
          minLength={2}
          maxLength={100}
          className={INPUT_CLASS}
        />
      </FormField>

      {/* Website */}
      <FormField
        label="Site Web de l'entreprise"
        icon={<Globe className="w-4 h-4" />}
        required
        helperText="Vous pouvez entrer simplement example.com (le https:// sera ajout\u00E9 automatiquement)"
      >
        <input
          type="text"
          value={formData.website}
          onChange={(e) => onChange('website', e.target.value)}
          placeholder="example.com"
          required
          className={INPUT_CLASS}
        />
      </FormField>

      {/* Email */}
      <FormField
        label="Email professionnel"
        icon={<Mail className="w-4 h-4" />}
        required
        helperText="Pour recevoir un r\u00E9cap de la d\u00E9mo et les infos utiles par email"
      >
        <input
          type="email"
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="jean.michel@google.com"
          required
          className={INPUT_CLASS}
        />
      </FormField>

      {/* Phone */}
      <FormField
        label="Num\u00E9ro de t\u00E9l\u00E9phone"
        icon={<Phone className="w-4 h-4" />}
        required
        helperText="Pour recevoir l'appel de notre agent"
      >
        <div className="flex gap-2">
          <select
            value={formData.countryCode}
            onChange={(e) => onChange('countryCode', e.target.value)}
            className={cn(
              'w-28 px-3 py-2 bg-black/30 border border-white/10',
              'rounded-lg text-white',
              'focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20',
              'transition-colors cursor-pointer',
            )}
          >
            {COUNTRY_CODES.map((country) => (
              <option key={country.value} value={country.value} className="bg-gray-900 text-white">
                {country.label}
              </option>
            ))}
          </select>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="06 12 34 56 78"
            required
            className={cn(INPUT_CLASS, 'flex-1')}
          />
        </div>
      </FormField>
    </>
  )
}

// ── CTAFormIntro component ───────────────────────────────────────

export function CTAFormIntro() {
  return (
    <div className="text-white/80 space-y-3 text-sm md:text-base">
      <p>
        Testez notre agent vocal intelligent, capable de rappeler vos leads entrants, de les
        qualifier et de prendre des rendez-vous \u00E0 votre place, 7j/7, en toute autonomie.
      </p>
      <p className="font-medium">Laissez vos coordonn\u00E9es ci-dessous :</p>
      <p className="flex items-start gap-2">
        <span>{'\u{1F449}'}</span>
        <span>
          Notre agent vous appellera dans les 30 prochaines secondes pour une d\u00E9monstration
          automatique.
        </span>
      </p>
      <p className="flex items-start gap-2">
        <span>{'\u{1F449}'}</span>
        <span>
          Vous pourrez ensuite r\u00E9server un cr\u00E9neau avec notre \u00E9quipe pour parler de
          son impl\u00E9mentation dans votre organisation.
        </span>
      </p>
    </div>
  )
}

// ── CTASubmitButton component ────────────────────────────────────

interface CTASubmitButtonProps {
  isFormValid: boolean
  isSubmitting: boolean
  className?: string
}

export function CTASubmitButton({ isFormValid, isSubmitting, className }: CTASubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isSubmitting || !isFormValid}
      className={cn(
        'w-full py-3 px-6 rounded-xl font-semibold',
        'bg-linear-to-r from-violet-600 to-purple-600',
        'text-white text-lg',
        'transition-all duration-300',
        'flex items-center justify-center gap-2',
        isFormValid &&
          !isSubmitting &&
          'hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/40',
        (isSubmitting || !isFormValid) && 'opacity-60 cursor-not-allowed',
        className,
      )}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Envoi en cours...
        </>
      ) : (
        'Lancer la d\u00E9monstration \u2728'
      )}
    </button>
  )
}

// ── CTAErrorMessage component ────────────────────────────────────

interface CTAErrorMessageProps {
  error: string | null
}

export function CTAErrorMessage({ error }: CTAErrorMessageProps) {
  if (!error) return null
  return (
    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-sm">
      {error}
    </div>
  )
}
