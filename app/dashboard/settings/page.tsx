import { redirect } from 'next/navigation'
import { checkIsAdminServer, getOrgId } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import type { OrgProfile } from '@/lib/types/settings'
import SettingsClient from './SettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const isAdmin = await checkIsAdminServer()
  const orgId = await getOrgId(supabase)

  let org: OrgProfile | null = null
  if (orgId) {
    const { data } = await supabase
      .from('organizations')
      .select('id, name, slug, industry, billing_email, settings, is_active')
      .eq('id', orgId)
      .single()
    org = data as OrgProfile | null
  }

  return <SettingsClient org={org} orgId={orgId} isAdmin={isAdmin} />
}
