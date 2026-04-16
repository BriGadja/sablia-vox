import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

interface JwtClaims {
  app_metadata?: { org_id?: string; is_admin?: boolean; org_ids?: string[] }
}

function decodeJwtClaims(accessToken: string | undefined): JwtClaims | null {
  if (!accessToken) return null
  const parts = accessToken.split('.')
  if (parts.length !== 3) return null
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf-8')) as JwtClaims
  } catch {
    return null
  }
}

/**
 * Extract org_id from the JWT claims (injected by custom_access_token_hook).
 * Supabase SSR strips custom claims from session.user.app_metadata, so we
 * decode the raw access_token ourselves.
 */
export async function getOrgId(supabase: SupabaseClient): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const claims = decodeJwtClaims(session?.access_token)
  return claims?.app_metadata?.org_id ?? null
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
