import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

/**
 * Extract org_id from the JWT claims (injected by custom_access_token_hook)
 * Uses getSession() to read JWT claims from the cookie — no server round-trip
 */
export async function getOrgId(supabase: SupabaseClient): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.app_metadata) return null
  return (session.user.app_metadata as Record<string, string>).org_id ?? null
}

/**
 * Check if the current user has admin permissions (server-side)
 * Queries user_org_memberships for 'admin' permission level, scoped by RLS
 * Browser-side variant: checkIsAdmin() in lib/queries/global.ts
 */
export async function checkIsAdminServer(): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_org_memberships')
    .select('permission_level')
    .eq('permission_level', 'admin')
    .limit(1)

  if (error) {
    console.error('Error checking admin status:', error)
    return false
  }

  return (data?.length ?? 0) > 0
}
