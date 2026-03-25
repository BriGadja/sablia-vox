'use client'

// 'use client' needed: form state management, validation, submission

import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const contactSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  entreprise: z.string().min(1, "Le nom de l'entreprise est requis"),
  secteur: z.string().min(1, 'Sélectionnez un secteur'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
})

type ContactData = z.infer<typeof contactSchema>

const SECTORS = [
  { value: 'immobilier', label: 'Immobilier' },
  { value: 'automobile', label: 'Automobile' },
  { value: 'assurance', label: 'Assurance' },
  { value: 'services', label: 'Services' },
  { value: 'sante', label: 'Santé' },
  { value: 'formation', label: 'Formation' },
  { value: 'autre', label: 'Autre' },
] as const

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface ContactFormProps {
  className?: string
}

export function ContactForm({ className }: ContactFormProps) {
  const [state, setState] = useState<FormState>('idle')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ContactData, string>>>({})
  const [globalError, setGlobalError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setGlobalError('')

    const formData = new FormData(e.currentTarget)
    const raw = {
      nom: formData.get('nom') as string,
      email: formData.get('email') as string,
      telephone: formData.get('telephone') as string,
      entreprise: formData.get('entreprise') as string,
      secteur: formData.get('secteur') as string,
      message: formData.get('message') as string,
    }

    const result = contactSchema.safeParse(raw)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactData, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ContactData
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    if (!consent) {
      setGlobalError('Veuillez accepter les conditions pour continuer.')
      return
    }

    setState('submitting')

    try {
      const res = await fetch('/api/demo-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...result.data, type: 'contact' }),
        signal: AbortSignal.timeout(10000),
      })

      if (!res.ok) {
        setGlobalError('Une erreur est survenue. Réessayez.')
        setState('error')
        return
      }

      setState('success')
    } catch {
      setGlobalError('Impossible de joindre le serveur. Réessayez.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div
        className={cn(
          'rounded-xl border border-primary/20 bg-primary/5 p-8 text-center',
          className,
        )}
      >
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-primary" />
        <p className="text-lg font-semibold text-foreground">Message envoyé !</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Notre équipe vous recontactera sous 24 heures.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-nom" className="text-sm text-muted-foreground">
            Nom *
          </Label>
          <Input
            id="contact-nom"
            name="nom"
            placeholder="Jean Dupont"
            className="mt-1 bg-card border-border"
            disabled={state === 'submitting'}
          />
          {errors.nom && <p className="mt-1 text-xs text-destructive">{errors.nom}</p>}
        </div>
        <div>
          <Label htmlFor="contact-email" className="text-sm text-muted-foreground">
            Email *
          </Label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            placeholder="jean@entreprise.fr"
            className="mt-1 bg-card border-border"
            disabled={state === 'submitting'}
          />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="contact-telephone" className="text-sm text-muted-foreground">
            Téléphone
          </Label>
          <Input
            id="contact-telephone"
            name="telephone"
            type="tel"
            placeholder="+33 6 12 34 56 78"
            className="mt-1 bg-card border-border font-[family-name:var(--font-mono)]"
            disabled={state === 'submitting'}
          />
        </div>
        <div>
          <Label htmlFor="contact-entreprise" className="text-sm text-muted-foreground">
            Entreprise *
          </Label>
          <Input
            id="contact-entreprise"
            name="entreprise"
            placeholder="Mon Entreprise SAS"
            className="mt-1 bg-card border-border"
            disabled={state === 'submitting'}
          />
          {errors.entreprise && (
            <p className="mt-1 text-xs text-destructive">{errors.entreprise}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="contact-secteur" className="text-sm text-muted-foreground">
          Secteur *
        </Label>
        <Select name="secteur" disabled={state === 'submitting'}>
          <SelectTrigger id="contact-secteur" className="mt-1 bg-card border-border">
            <SelectValue placeholder="Sélectionnez votre secteur" />
          </SelectTrigger>
          <SelectContent>
            {SECTORS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.secteur && <p className="mt-1 text-xs text-destructive">{errors.secteur}</p>}
      </div>

      <div>
        <Label htmlFor="contact-message" className="text-sm text-muted-foreground">
          Message *
        </Label>
        <Textarea
          id="contact-message"
          name="message"
          placeholder="Décrivez votre besoin..."
          rows={4}
          className="mt-1 bg-card border-border resize-none"
          disabled={state === 'submitting'}
        />
        {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="contact-rgpd"
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked === true)}
          disabled={state === 'submitting'}
          className="mt-0.5"
        />
        <Label
          htmlFor="contact-rgpd"
          className="text-xs leading-relaxed text-muted-foreground cursor-pointer"
        >
          J'accepte que mes données soient utilisées pour un suivi commercial
        </Label>
      </div>

      {globalError && (
        <div className="flex items-center gap-2 text-sm text-destructive" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={state === 'submitting' || !consent}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {state === 'submitting' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          'Envoyer'
        )}
      </Button>
    </form>
  )
}
