import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { OrgMember } from '@/lib/types/settings'

export function useOrgMembers(orgId: string | null) {
  return useQuery<OrgMember[]>({
    queryKey: ['org-members', orgId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_org_memberships')
        .select(
          'id, user_id, org_id, permission_level, is_default, created_at, users(email, full_name, role, avatar_url)',
        )
        // biome-ignore lint/style/noNonNullAssertion: orgId is guaranteed non-null by enabled guard
        .eq('org_id', orgId!)
        .order('created_at')
      if (error) throw error
      return data as unknown as OrgMember[]
    },
    enabled: !!orgId,
    staleTime: 3600000,
  })
}
