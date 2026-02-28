'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Composant qui intercepte les tokens d'authentification dans le hash de l'URL
 * et redirige vers la page appropriée
 */
export function AuthHashHandler() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Ne rien faire si on est déjà sur une page d'auth
    if (pathname.startsWith('/auth/')) {
      return
    }

    // Vérifier s'il y a un hash avec des paramètres d'authentification
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const type = hashParams.get('type')

      // Si on détecte un token d'authentification, rediriger vers /auth/confirm
      if (accessToken && (type === 'invite' || type === 'recovery' || type === 'magiclink')) {
        // Préserver le hash complet pour que /auth/confirm puisse l'utiliser
        router.push(`/auth/confirm${window.location.hash}`)
      }
    }
  }, [pathname, router])

  return null // Ce composant ne rend rien
}
