import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client with service_role key.
 * Bypasses RLS — use only in API routes behind auth guards.
 * NEVER import from client components.
 *
 * Throws at call time if required env vars are missing, so the failure surfaces
 * as a 500 with a clear message instead of PostgREST "Invalid API key" replies
 * that get swallowed into empty query results.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      `Missing Supabase env var(s): ${[!url && 'NEXT_PUBLIC_SUPABASE_URL', !key && 'SUPABASE_SERVICE_ROLE_KEY'].filter(Boolean).join(', ')}`,
    )
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
