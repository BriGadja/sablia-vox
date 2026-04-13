'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ConfirmPage() {
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      try {
        // Vérifier s'il y a un hash avec des paramètres d'authentification
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        if (accessToken && refreshToken) {
          // Définir la session avec les tokens
          const { data: _data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (sessionError) {
            console.error('Erreur session:', sessionError)
            setError(sessionError.message)
            router.push('/auth/error')
            return
          }

          // Si c'est une invitation, rediriger vers la page de définition de mot de passe
          if (type === 'invite' || type === 'recovery') {
            router.push('/auth/update-password')
          } else {
            // Sinon, rediriger vers le dashboard
            router.push('/dashboard')
          }
        } else {
          // Pas de token dans le hash, essayer avec le code (flow PKCE)
          const urlParams = new URLSearchParams(window.location.search)
          const code = urlParams.get('code')

          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

            if (exchangeError) {
              console.error('Erreur échange code:', exchangeError)
              setError(exchangeError.message)
              router.push('/auth/error')
              return
            }

            router.push('/dashboard')
          } else {
            // Aucun token ou code trouvé
            console.error('Aucun token trouvé')
            router.push('/auth/error')
          }
        }
      } catch (err) {
        console.error('Erreur:', err)
        setError('Une erreur est survenue')
        router.push('/auth/error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-linear-to-br from-purple-900/20 via-black to-blue-900/20">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center">
        <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-4" />
        <p className="text-white/60">
          {error ? `Erreur: ${error}` : 'Vérification de votre invitation...'}
        </p>
      </div>
    </main>
  )
}
