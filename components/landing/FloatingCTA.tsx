'use client'

import { Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import CTAPopupForm from '@/components/ui/CTAPopupForm'
import SuccessToast from '@/components/ui/SuccessToast'

export function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Afficher le bouton après avoir scrollé 500px (après le Hero)
      setIsVisible(window.scrollY > 500)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSuccess = () => {
    setIsPopupOpen(false)
    setShowSuccess(true)
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsPopupOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105 transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
        aria-label="Recevez un appel de demo"
      >
        <Phone className="w-5 h-5 animate-pulse" />
        <span className="hidden sm:inline">Recevez un appel de demo</span>
        <span className="sm:hidden">Tester</span>
      </button>

      {/* Popup Form */}
      <CTAPopupForm
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSuccess={handleSuccess}
      />

      {/* Success Toast */}
      <SuccessToast
        show={showSuccess}
        message="Parfait ! Notre agent va vous appeler dans quelques secondes."
        onClose={() => setShowSuccess(false)}
      />
    </>
  )
}
