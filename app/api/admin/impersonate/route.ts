import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ApiError, handleApiError, requireAdmin } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const impersonateSchema = z.object({
  email: z.email(),
})

export async function POST(request: Request) {
  try {
    const { userId } = await requireAdmin()

    const body = await request.json().catch(() => null)
    const parsed = impersonateSchema.safeParse(body)
    if (!parsed.success) {
      throw new ApiError('Email invalide', 400)
    }
    const targetEmail = parsed.data.email.toLowerCase().trim()

    // Capture the admin's own email for the audit row
    const supabase = await createClient()
    const {
      data: { user: adminUser },
    } = await supabase.auth.getUser()
    if (!adminUser?.email) {
      throw new ApiError('Email administrateur introuvable', 403)
    }

    if (targetEmail === adminUser.email.toLowerCase()) {
      throw new ApiError('Impossible de se substituer à soi-même', 400)
    }

    const admin = createAdminClient()

    // Verify target user exists in users table (joined with auth.users via trigger)
    const { data: targetRow } = await admin
      .from('users')
      .select('id, email')
      .eq('email', targetEmail)
      .limit(1)
      .abortSignal(AbortSignal.timeout(5000))
      .maybeSingle()

    if (!targetRow) {
      throw new ApiError('Utilisateur introuvable', 404)
    }

    // Build redirect URL — prefer Origin header (correct scheme), then forwarded
    // host with explicit proto (Vercel/proxy), fall back to request URL.
    const originHeader = request.headers.get('origin')
    const forwardedHost = request.headers.get('x-forwarded-host')
    const forwardedProto = request.headers.get('x-forwarded-proto')
    let origin: string
    if (originHeader) {
      origin = originHeader
    } else if (forwardedHost) {
      origin = `${forwardedProto ?? 'https'}://${forwardedHost}`
    } else {
      origin = new URL(request.url).origin
    }
    const redirectTo = `${origin}/auth/callback?next=/dashboard`

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: targetEmail,
      options: { redirectTo },
    })

    const hashedToken = linkData?.properties?.hashed_token
    if (linkError || !hashedToken) {
      console.error('generateLink error:', linkError)
      throw new ApiError('Erreur lors de la génération du lien', 500)
    }

    // Build a token_hash URL — works cross-browser (no PKCE code_verifier dependency).
    // The /auth/callback route verifies via verifyOtp({ token_hash, type: 'email' }).
    const actionLink = `${origin}/auth/callback?token_hash=${encodeURIComponent(hashedToken)}&type=email&next=${encodeURIComponent('/dashboard')}`

    const { error: logError } = await admin
      .from('impersonation_log')
      .insert({
        admin_user_id: userId,
        admin_email: adminUser.email,
        impersonated_user_id: targetRow.id,
        impersonated_email: targetEmail,
      })
      .abortSignal(AbortSignal.timeout(5000))

    if (logError) {
      console.error('impersonation_log insert error:', logError)
      // Do not fail the request -- audit log failure shouldn't block debugging.
      // Surface via server logs for follow-up.
    }

    return NextResponse.json({
      action_link: actionLink,
      impersonated_email: targetEmail,
    })
  } catch (err) {
    return handleApiError(err)
  }
}
