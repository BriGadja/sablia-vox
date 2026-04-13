import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { OrgMember } from '@/lib/types/settings'

export function useOrgMembers() {
  return useQuery<OrgMember[]>({
    queryKey: ['org-members'],
    queryFn: async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const orgId = session?.user?.app_metadata?.org_id
      const { data, error } = await supabase
        .from('user_org_memberships')
        .select(
          'id, user_id, org_id, permission_level, is_default, created_at, users(email, full_name, role, avatar_url)',
        )
        .eq('org_id', orgId)
        .order('created_at')
      if (error) throw error
      return data as unknown as OrgMember[]
    },
    staleTime: 3600000,
  })
}
