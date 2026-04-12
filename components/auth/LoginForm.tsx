'use client'

import { Check, Eye, EyeOff, Loader2, LogIn, Mail } from 'lucide-react'
import { motion } from 'motion/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function getSafeRedirect(value: string | null): string {
  if (!value) return '/dashboard'
  try {
    const url = new URL(value, window.location.origin)
    return url.origin === window.location.origin ? url.pathname + url.search : '/dashboard'
  } catch {
    return '/dashboard'
  }
}

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [magicLinkMode, setMagicLinkMode] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  const handleLogin = async (e: React.FormEvent) => {
    const supabase = createClient()
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validation simple
      if (!email || !password) {
        setError('Veuillez remplir tous les champs')
        setIsLoading(false)
        return
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setError("Format d'email invalide")
        setIsLoading(false)
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Email ou mot de passe incorrect')
        } else {
          setError(signInError.message)
        }
        setIsLoading(false)
        return
      }

      // Success - redirect to target or dashboard
      router.push(getSafeRedirect(redirect))
      router.refresh()
    } catch (_err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setIsLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    setMagicLinkSent(false)

    if (!email) {
      setError('Veuillez entrer votre email')
      setIsLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Format d'email invalide")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(getSafeRedirect(redirect))}`,
        },
      })

      if (otpError) {
        if (otpError.message.includes('Signups not allowed')) {
          setError('Aucun compte trouvé pour cet email')
        } else {
          setError(otpError.message)
        }
        setIsLoading(false)
        return
      }

      setMagicLinkSent(true)
      setIsLoading(false)
    } catch (_err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
        {/* Info banner for prospects */}
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-blue-300 text-center">
            <span className="font-semibold">Espace réservé aux clients.</span> Pas encore client ?{' '}
            <a
              href="https://forms.fillout.com/t/nU9QEqNRRRus"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-200 transition-colors"
            >
              Découvrez nos solutions
            </a>
          </p>
        </div>

        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            className="inline-block mb-4"
          >
            <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <LogIn className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Connexion Dashboard</h1>
          <p className="text-white/60">Accédez à vos statistiques d&apos;agents IA</p>
        </div>

        {magicLinkMode ? (
          <form onSubmit={handleMagicLink} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || magicLinkSent}
                className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
                placeholder="votre@email.com"
                autoComplete="email"
              />
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg"
              >
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Success message */}
            {magicLinkSent && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg"
              >
                <p className="text-sm text-green-400 flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Lien de connexion envoyé ! Vérifiez votre boîte email.
                </p>
              </motion.div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || magicLinkSent}
              className="w-full px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-600/50 disabled:to-blue-600/50 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Envoyer le lien
                </>
              )}
            </button>

            {/* Switch to password mode */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setMagicLinkMode(false)
                  setError('')
                  setMagicLinkSent(false)
                }}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Se connecter avec mot de passe
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50"
                placeholder="votre@email.com"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all disabled:opacity-50 pr-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors disabled:opacity-50"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg"
              >
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}

            {/* Forgot password link */}
            <div className="text-right">
              <a
                href="/auth/reset-password"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Mot de passe oublié ?
              </a>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-purple-600/50 disabled:to-blue-600/50 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Se connecter
                </>
              )}
            </button>

            {/* Divider + Magic link option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black/40 px-2 text-white/40">ou</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setMagicLinkMode(true)
                setError('')
              }}
              className="w-full px-6 py-3 border border-white/20 hover:border-white/30 text-white/80 hover:text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Recevoir un lien magique
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 space-y-3">
          <div className="text-center">
            <p className="text-sm text-white/60">
              Vous n&apos;avez pas de compte ?{' '}
              <a
                href="mailto:brice@sablia.io"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Contactez l&apos;administrateur
              </a>
            </p>
          </div>
          <div className="text-center pt-3 border-t border-white/10">
            <p className="text-xs text-white/40 mb-2">Pas encore client ?</p>
            <a
              href="https://forms.fillout.com/t/nU9QEqNRRRus"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              <span>Essayer Sablia Vox gratuitement</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
