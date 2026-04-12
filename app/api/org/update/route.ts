import { NextResponse } from 'next/server'
import { ApiError, handleApiError, requireAdmin } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { updateOrgSchema } from '@/lib/types/settings'

export async function PUT(request: Request) {
  try {
    const { orgId } = await requireAdmin()

    const body = await request.json()
    const parsed = updateOrgSchema.safeParse(body)
    if (!parsed.success) {
      throw new ApiError('Données invalides', 400)
    }

    const updates = parsed.data
    if (Object.keys(updates).length === 0) {
      throw new ApiError('Aucune modification fournie', 400)
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('organizations')
      .update(updates)
      .eq('id', orgId)
      .select()
      .single()

    if (error) {
      console.error('Org update error:', error)
      throw new ApiError('Erreur lors de la mise à jour', 500)
    }

    return NextResponse.json(data)
  } catch (err) {
    return handleApiError(err)
  }
}
