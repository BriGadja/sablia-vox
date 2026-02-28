'use client'

import Link from 'next/link'
import { useState } from 'react'
import CTAPopupForm from '@/components/ui/CTAPopupForm'
import SuccessToast from '@/components/ui/SuccessToast'

export function HeaderV2() {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent hover:from-violet-300 hover:to-purple-300 transition"
            >
              Sablia Vox
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex items-center gap-8">
              {/* Solutions - Ancre vers Comment ça fonctionne */}
              <a
                href="#comment-ca-fonctionne"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Solutions
              </a>

              <a href="#faq" className="text-gray-300 hover:text-white transition-colors">
                FAQ
              </a>
            </nav>

            {/* CTAs */}
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Connexion
              </Link>
              <button
                onClick={() => setIsPopupOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg text-sm font-semibold hover:from-violet-700 hover:to-purple-700 transition-all hover:shadow-lg hover:shadow-violet-500/20"
              >
                TESTER NOS AGENTS
              </button>
            </div>
          </div>
        </div>
      </header>

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
    </>
  )
}
