import { getOrgId } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Require authenticated admin user for API route handlers.
 * Reads org_id from the JWT (injected by custom_access_token_hook) via getOrgId,
 * NOT from auth.users.app_metadata which is not populated by the hook.
 */
export async function requireAdmin(): Promise<{ userId: string; orgId: string }> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new ApiError('Non authentifié', 401)
  }

  const orgId = await getOrgId(supabase)
  if (!orgId) {
    throw new ApiError('Organisation introuvable', 403)
  }

  const { data } = await supabase
    .from('user_org_memberships')
    .select('permission_level')
    .eq('permission_level', 'admin')
    .eq('org_id', orgId)
    .limit(1)

  if (!data?.length) {
    throw new ApiError('Accès refusé — administrateur requis', 403)
  }

  return { userId: user.id, orgId }
}

/**
 * Helper to catch ApiError and return appropriate JSON response.
 */
export function handleApiError(err: unknown): Response {
  if (err instanceof ApiError) {
    return Response.json({ error: err.message }, { status: err.status })
  }
  console.error('Unexpected API error:', err)
  return Response.json({ error: 'Erreur interne du serveur' }, { status: 500 })
}
