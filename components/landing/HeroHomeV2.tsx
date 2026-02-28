'use client'

import { useState } from 'react'
import { RippleBackground } from '@/components/animations/RippleBackground'
import { Button } from '@/components/shared/Button'
import CTAPopupForm from '@/components/ui/CTAPopupForm'
import SuccessToast from '@/components/ui/SuccessToast'

export function HeroHomeV2() {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated ripple background */}
      <RippleBackground />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Main heading - NOUVEAU TITRE */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Déléguez le traitement{' '}
            </span>
            <br />
            <span className="text-white">de vos appels à nos agents IA</span>
          </h1>

          {/* Subtitle - NOUVEAU SOUS-TITRE */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Nos agents IA répondent et rappellent 24/7, qualifient vos prospects, prennent vos
            rendez-vous et répondent aux questions courantes.
            <br />
            <span className="text-violet-300 font-semibold">
              Résultat : zéro appel manqué, zéro interruption pour vos équipes. Vous vous concentrez
              sur ce qui compte vraiment.
            </span>
          </p>

          {/* CTA - Sans les cartes agents */}
          <div className="flex justify-center items-center pt-8">
            <Button size="lg" onClick={() => setIsPopupOpen(true)}>
              TESTER NOS AGENTS
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-gray-950 to-transparent" />

      {/* Popup & Toast */}
      <CTAPopupForm
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSuccess={() => setShowSuccessToast(true)}
      />

      <SuccessToast
        show={showSuccessToast}
        message="Vous allez recevoir un appel dans 30 secondes !"
        onClose={() => setShowSuccessToast(false)}
      />
    </section>
  )
}
