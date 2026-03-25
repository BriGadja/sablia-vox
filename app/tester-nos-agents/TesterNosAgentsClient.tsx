'use client'

import { useState } from 'react'
import { HeaderV2 } from '@/components/shared/HeaderV2'
import CTAStaticForm from '@/components/ui/CTAStaticForm'
import SuccessToast from '@/components/ui/SuccessToast'

export default function TesterNosAgentsClient() {
  const [showSuccessToast, setShowSuccessToast] = useState(false)

  return (
    <>
      <HeaderV2 />

      <main className="min-h-screen bg-gray-950 pt-16">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-linear-to-br from-violet-950/20 via-gray-950 to-purple-950/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Page Header */}
          <div className="text-center mb-8 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-linear-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Testez nos Agents IA
              </span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              Remplissez le formulaire ci-dessous et recevez un appel de démonstration en 30
              secondes
            </p>
          </div>

          {/* Form Container */}
          <CTAStaticForm onSuccess={() => setShowSuccessToast(true)} />
        </div>
      </main>

      {/* Success Toast */}
      <SuccessToast
        show={showSuccessToast}
        message="Vous allez recevoir un appel dans 30 secondes ! 🎙️"
        onClose={() => setShowSuccessToast(false)}
      />
    </>
  )
}
