'use client'

// 'use client' needed: Dialog interactivity, localStorage, supabase.auth.updateUser()

import { BarChart3, Bot, PhoneCall } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY = 'vox-onboarded'

const FEATURES = [
  {
    icon: BarChart3,
    title: "Vue d'ensemble",
    description: 'KPIs, volumes, tendances',
  },
  {
    icon: Bot,
    title: 'Vos agents',
    description: 'Performance, appels, suggestions',
  },
  {
    icon: PhoneCall,
    title: 'Historique',
    description: 'Détails, enregistrements, transcriptions',
  },
] as const

interface WelcomeModalProps {
  showWelcome: boolean
}

export function WelcomeModal({ showWelcome }: WelcomeModalProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!showWelcome) return
    if (localStorage.getItem(STORAGE_KEY)) return
    setOpen(true)
  }, [showWelcome])

  function handleDismiss() {
    setOpen(false)
    localStorage.setItem(STORAGE_KEY, 'true')

    const supabase = createClient()
    supabase.auth.updateUser({
      data: { onboarded_at: new Date().toISOString() },
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) handleDismiss()
      }}
    >
      <DialogContent className="border-white/10 bg-background sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="font-[family-name:var(--font-display)] text-xl font-bold text-foreground">
            Bienvenue sur Sablia Vox
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Votre tableau de bord pour suivre vos agents vocaux en temps réel.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="flex items-start gap-3 rounded-lg p-3 glass-subtle"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          C&apos;est parti &rarr;
        </button>
      </DialogContent>
    </Dialog>
  )
}
