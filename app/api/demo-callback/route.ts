import { NextResponse } from 'next/server'
import { z } from 'zod'

const phoneCallbackSchema = z.object({
  phone: z.string().regex(/^\+33[0-9]{9}$/, 'Numéro invalide'),
})

const contactFormSchema = z.object({
  type: z.literal('contact'),
  nom: z.string().min(2),
  email: z.string().email(),
  telephone: z.string().optional(),
  entreprise: z.string().min(1),
  secteur: z.string().min(1),
  message: z.string().min(10),
})

const requestSchema = z.union([phoneCallbackSchema, contactFormSchema])

/**
 * POST /api/demo-callback
 *
 * Handles two types of submissions:
 * 1. Phone callback: validates E.164 phone and triggers n8n webhook
 * 2. Contact form: validates fields and forwards to webhook
 *
 * Rate limiting is placeholder — will be wired to Supabase `demo_rate_limits` in E3/E4.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const result = requestSchema.safeParse(body)
  if (!result.success) {
    const firstIssue = result.error.issues[0]
    return NextResponse.json(
      { error: firstIssue?.message ?? 'Données invalides', code: 'VALIDATION_ERROR' },
      { status: 400 },
    )
  }

  // Rate limit placeholder — TODO: wire to Supabase demo_rate_limits table
  // For now, this is a no-op. In production, check IP-based rate limits.

  const webhookUrl = process.env.DEMO_CALLBACK_URL
  if (!webhookUrl) {
    // In development without a webhook URL, return success for testing
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ status: 'ok', message: 'Dev mode — webhook skipped' })
    }
    return NextResponse.json(
      { error: 'Service temporairement indisponible', code: 'WEBHOOK_NOT_CONFIGURED' },
      { status: 503 },
    )
  }

  try {
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result.data),
      signal: AbortSignal.timeout(10000),
    })

    if (!webhookResponse.ok) {
      return NextResponse.json(
        { error: 'Erreur lors du traitement. Réessayez.', code: 'WEBHOOK_ERROR' },
        { status: 502 },
      )
    }

    return NextResponse.json({ status: 'ok' })
  } catch {
    return NextResponse.json(
      { error: 'Le service ne répond pas. Réessayez.', code: 'WEBHOOK_TIMEOUT' },
      { status: 504 },
    )
  }
}
