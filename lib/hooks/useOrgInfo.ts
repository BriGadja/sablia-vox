import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { OrgProfile } from '@/lib/types/settings'

export function useOrgInfo() {
  return useQuery<OrgProfile>({
    queryKey: ['org-info'],
    queryFn: async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      const orgId = session?.user?.app_metadata?.org_id
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug, industry, billing_email, settings, is_active')
        .eq('id', orgId)
        .single()
      if (error) throw error
      return data as OrgProfile
    },
    staleTime: 3600000,
  })
}
