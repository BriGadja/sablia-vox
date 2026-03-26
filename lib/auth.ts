import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Extract org_id from the JWT claims (injected by custom_access_token_hook)
 * Uses getSession() to read JWT claims from the cookie — no server round-trip
 */
export async function getOrgId(supabase: SupabaseClient): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.app_metadata) return null
  return (session.user.app_metadata as Record<string, string>).org_id ?? null
}
