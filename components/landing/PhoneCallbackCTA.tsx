'use client'

// 'use client' needed: form state management, user input, API calls

import { AlertCircle, CheckCircle2, Loader2, Phone } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/** Normalize French phone numbers: accepts +33X, 0X, or X (without prefix) */
function normalizeFrenchPhone(raw: string): string {
  const digits = raw.replace(/[\s\-.()]/g, '')
  // Already E.164: +33XXXXXXXXX
  if (/^\+33\d{9}$/.test(digits)) return digits
  // Starts with 0: 0XXXXXXXXX → +33XXXXXXXXX
  if (/^0\d{9}$/.test(digits)) return `+33${digits.slice(1)}`
  // Raw 9 digits (no prefix): XXXXXXXXX → +33XXXXXXXXX
  if (/^\d{9}$/.test(digits)) return `+33${digits}`
  return digits
}

const phoneSchema = z
  .string()
  .transform(normalizeFrenchPhone)
  .pipe(
    z
      .string()
      .regex(/^\+33[0-9]{9}$/, 'Numéro invalide (format : 06 12 34 56 78 ou +33 6 12 34 56 78)'),
  )

type CallbackState = 'idle' | 'submitting' | 'calling' | 'success' | 'error'

interface PhoneCallbackCTAProps {
  className?: string
  /** Compact variant for reuse in final CTA */
  compact?: boolean
}

export function PhoneCallbackCTA({ className, compact = false }: PhoneCallbackCTAProps) {
  const [phone, setPhone] = useState('+33 ')
  const [consent, setConsent] = useState(false)
  const [state, setState] = useState<CallbackState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    const result = phoneSchema.safeParse(phone)
    if (!result.success) {
      setErrorMessage(result.error.issues[0]?.message ?? 'Numéro invalide')
      return
    }

    if (!consent) {
      setErrorMessage('Veuillez accepter les conditions pour continuer.')
      return
    }

    setState('submitting')

    try {
      const res = await fetch('/api/demo-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: result.data }),
        signal: AbortSignal.timeout(10000),
      })

      const data = (await res.json()) as { error?: string; code?: string }

      if (!res.ok) {
        if (res.status === 429) {
          setErrorMessage('Trop de tentatives, réessayez dans 1 heure.')
          setState('error')
          return
        }
        setErrorMessage(data.error ?? 'Une erreur est survenue. Réessayez.')
        setState('error')
        return
      }

      setState('calling')

      // Transition to success after 15 seconds (simulates call duration)
      setTimeout(() => {
        setState('success')
      }, 15000)
    } catch {
      setErrorMessage('Impossible de joindre le serveur. Réessayez.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div
        className={cn(
          'rounded-xl border border-primary/20 bg-primary/5 p-6 text-center',
          className,
        )}
      >
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-primary" />
        <p className="text-lg font-semibold text-foreground">Merci pour cet essai !</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Nous espérons que la démonstration vous a plu.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="default"
            asChild
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <a href="#contact">Prendre rendez-vous</a>
          </Button>
          <Button variant="outline" asChild>
            <a href="#contact">Nous contacter</a>
          </Button>
        </div>
      </div>
    )
  }

  if (state === 'calling') {
    return (
      <div
        className={cn(
          'rounded-xl border border-primary/20 bg-primary/5 p-6 text-center',
          className,
        )}
      >
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 motion-safe:animate-pulse">
          <Phone className="h-7 w-7 text-primary" />
        </div>
        <p className="text-lg font-semibold text-foreground">Appel en cours...</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Votre téléphone va sonner d'un instant à l'autre.
        </p>
        <div className="mt-3 flex justify-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="inline-block h-6 w-1.5 rounded-full bg-primary motion-safe:animate-[waveform-bar_0.6s_ease-in-out_infinite]"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('w-full max-w-md', compact ? 'space-y-3' : 'space-y-4', className)}
    >
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+33 6 12 34 56 78"
            className="pl-10 font-[family-name:var(--font-mono)] bg-card border-border focus:border-primary focus:ring-primary"
            aria-label="Numéro de téléphone"
            disabled={state === 'submitting'}
          />
        </div>
        <Button
          type="submit"
          disabled={state === 'submitting' || !consent}
          className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-shadow motion-safe:animate-[glow-pulse_2s_ease-in-out_infinite] disabled:opacity-50 disabled:shadow-none whitespace-nowrap"
        >
          {state === 'submitting' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Tester maintenant'
          )}
        </Button>
      </div>

      <div className="flex items-start gap-2">
        <Checkbox
          id="rgpd-consent"
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked === true)}
          disabled={state === 'submitting'}
          className="mt-0.5"
        />
        <Label
          htmlFor="rgpd-consent"
          className="text-xs leading-relaxed text-muted-foreground cursor-pointer"
        >
          J'accepte que mes données soient utilisées pour un suivi commercial
        </Label>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-sm text-destructive" role="alert">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </form>
  )
}
