import { NextResponse } from 'next/server'
import { ApiError, handleApiError, requireAdmin } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { memberActionSchema } from '@/lib/types/settings'

export async function POST(request: Request) {
  try {
    const { userId, orgId } = await requireAdmin()

    const body = await request.json()
    const parsed = memberActionSchema.safeParse(body)
    if (!parsed.success) {
      throw new ApiError('Données invalides', 400)
    }

    const admin = createAdminClient()
    const action = parsed.data

    switch (action.action) {
      case 'invite':
        return await handleInvite(admin, orgId, action.email, action.role, request)
      case 'change_role':
        return await handleRoleChange(admin, orgId, action.memberId, action.role)
      case 'remove':
        return await handleRemove(admin, orgId, userId, action.memberId)
    }
  } catch (err) {
    return handleApiError(err)
  }
}

async function handleInvite(
  admin: ReturnType<typeof createAdminClient>,
  orgId: string,
  email: string,
  role: string,
  request: Request,
) {
  // Check if user already has a membership in this org
  const { data: existingMembers } = await admin
    .from('user_org_memberships')
    .select('id, user_id')
    .eq('org_id', orgId)

  // Check if the email already belongs to an existing user
  const { data: existingUsers } = await admin
    .from('users')
    .select('id, email')
    .eq('email', email)
    .limit(1)

  const existingUser = existingUsers?.[0]
  if (existingUser) {
    const alreadyMember = existingMembers?.some((m) => m.user_id === existingUser.id)
    if (alreadyMember) {
      throw new ApiError('Cet utilisateur est déjà membre de l\'organisation', 409)
    }
  }

  // Build redirect URL
  const origin = request.headers.get('origin') || request.headers.get('x-forwarded-host')
    ? `https://${request.headers.get('x-forwarded-host')}`
    : new URL(request.url).origin
  const redirectTo = `${origin}/auth/callback?next=/dashboard`

  // Invite user via Supabase Auth admin API
  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  })

  if (inviteError) {
    console.error('Invite error:', inviteError)
    throw new ApiError('Erreur lors de l\'invitation', 500)
  }

  // Create membership for the invited user
  const { error: membershipError } = await admin.from('user_org_memberships').insert({
    user_id: inviteData.user.id,
    org_id: orgId,
    permission_level: role,
  })

  if (membershipError) {
    console.error('Membership insert error:', membershipError)
    throw new ApiError('Erreur lors de la création du membership', 500)
  }

  return NextResponse.json({ message: 'Invitation envoyée' }, { status: 201 })
}

async function handleRoleChange(
  admin: ReturnType<typeof createAdminClient>,
  orgId: string,
  memberId: string,
  role: string,
) {
  const { data, error } = await admin
    .from('user_org_memberships')
    .update({ permission_level: role })
    .eq('id', memberId)
    .eq('org_id', orgId)
    .select()
    .single()

  if (error) {
    console.error('Role change error:', error)
    throw new ApiError('Erreur lors du changement de rôle', 500)
  }

  return NextResponse.json(data)
}

async function handleRemove(
  admin: ReturnType<typeof createAdminClient>,
  orgId: string,
  currentUserId: string,
  memberId: string,
) {
  // Get the member to check constraints
  const { data: member, error: fetchError } = await admin
    .from('user_org_memberships')
    .select('id, user_id, permission_level')
    .eq('id', memberId)
    .eq('org_id', orgId)
    .single()

  if (fetchError || !member) {
    throw new ApiError('Membre introuvable', 404)
  }

  // Prevent self-removal
  if (member.user_id === currentUserId) {
    throw new ApiError('Vous ne pouvez pas vous retirer vous-même', 400)
  }

  // Prevent removing last admin
  if (member.permission_level === 'admin') {
    const { count } = await admin
      .from('user_org_memberships')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('permission_level', 'admin')

    if ((count ?? 0) <= 1) {
      throw new ApiError('Impossible de retirer le dernier administrateur', 400)
    }
  }

  const { error: deleteError } = await admin
    .from('user_org_memberships')
    .delete()
    .eq('id', memberId)
    .eq('org_id', orgId)

  if (deleteError) {
    console.error('Member removal error:', deleteError)
    throw new ApiError('Erreur lors de la suppression', 500)
  }

  return NextResponse.json({ message: 'Membre retiré' })
}
