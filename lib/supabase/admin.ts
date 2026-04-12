import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client with service_role key.
 * Bypasses RLS — use only in API routes behind auth guards.
 * NEVER import from client components.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}
