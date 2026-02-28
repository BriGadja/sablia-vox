import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        // En développement local, utiliser localhost
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        // En production avec proxy
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        // Fallback sur l'origine
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Rediriger vers une page d'erreur si quelque chose ne va pas
  return NextResponse.redirect(`${origin}/auth/error`)
}
