import { type NextRequest, NextResponse } from 'next/server'
import { handleApiError, requireAdmin } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  try {
    const { userId } = await requireAdmin()

    const admin = createAdminClient()

    const debug = req.nextUrl.searchParams.has('debug')

    // Find all orgs where the admin has a membership (usually multiple for super-admins)
    const { data: adminOrgs, error: adminOrgsError } = await admin
      .from('user_org_memberships')
      .select('org_id')
      .eq('user_id', userId)
      .abortSignal(AbortSignal.timeout(5000))

    if (adminOrgsError || !adminOrgs?.length) {
      console.error('admin/users: adminOrgs empty', {
        userId,
        error: adminOrgsError,
        adminOrgsLen: adminOrgs?.length,
      })
      return NextResponse.json({ users: [], _debug: { reason: 'adminOrgs_empty', userId, error: adminOrgsError?.message, adminOrgsLen: adminOrgs?.length } })
    }

    const orgIds = adminOrgs.map((row) => row.org_id)

    // All users who are members of any of the admin's orgs
    const { data: members, error: membersError } = await admin
      .from('user_org_memberships')
      .select('user_id, org_id, permission_level, users(email, full_name)')
      .in('org_id', orgIds)
      .abortSignal(AbortSignal.timeout(5000))

    if (membersError) {
      console.error('admin/users: members fetch error', membersError)
      return NextResponse.json({ users: [], _debug: { reason: 'members_error', error: membersError.message, orgIds } })
    }

    if (debug) {
      return NextResponse.json({ _debug: { orgIds, membersLen: members?.length, sample: members?.slice(0, 3) } })
    }

    // Deduplicate by user_id -- prefer rows with a non-null user + email
    const byUserId = new Map<
      string,
      {
        id: string
        email: string
        full_name: string | null
        orgs: Array<{ org_id: string; permission_level: string }>
      }
    >()

    for (const row of members ?? []) {
      const user = row.users as { email?: string; full_name?: string | null } | null
      if (!user?.email) continue
      const existing = byUserId.get(row.user_id)
      if (existing) {
        existing.orgs.push({ org_id: row.org_id, permission_level: row.permission_level })
      } else {
        byUserId.set(row.user_id, {
          id: row.user_id,
          email: user.email,
          full_name: user.full_name ?? null,
          orgs: [{ org_id: row.org_id, permission_level: row.permission_level }],
        })
      }
    }

    const users = Array.from(byUserId.values())
      .filter((u) => u.id !== userId) // exclude the admin themselves
      .sort((a, b) => a.email.localeCompare(b.email))

    return NextResponse.json({ users })
  } catch (err) {
    return handleApiError(err)
  }
}
