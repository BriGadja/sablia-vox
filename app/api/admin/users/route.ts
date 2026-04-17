import { NextResponse } from 'next/server'
import { handleApiError, requireAdmin } from '@/lib/api-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const { userId } = await requireAdmin()

    const admin = createAdminClient()

    const { data: adminOrgs, error: adminOrgsError } = await admin
      .from('user_org_memberships')
      .select('org_id')
      .eq('user_id', userId)
      .abortSignal(AbortSignal.timeout(5000))

    if (adminOrgsError) {
      console.error('admin/users adminOrgs error:', adminOrgsError)
      return NextResponse.json({ error: adminOrgsError.message }, { status: 500 })
    }
    if (!adminOrgs?.length) {
      return NextResponse.json({ users: [] })
    }

    const orgIds = adminOrgs.map((row) => row.org_id)

    const { data: members, error: membersError } = await admin
      .from('user_org_memberships')
      .select('user_id, org_id, permission_level, users(email, full_name)')
      .in('org_id', orgIds)
      .abortSignal(AbortSignal.timeout(5000))

    if (membersError) {
      console.error('admin/users members error:', membersError)
      return NextResponse.json({ error: membersError.message }, { status: 500 })
    }

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
      .filter((u) => u.id !== userId)
      .sort((a, b) => a.email.localeCompare(b.email))

    return NextResponse.json({ users })
  } catch (err) {
    return handleApiError(err)
  }
}
