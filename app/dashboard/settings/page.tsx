'use client'

import { useQuery } from '@tanstack/react-query'
import { Building2, Loader2, Mail, Settings, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function useOrgInfo() {
  return useQuery({
    queryKey: ['org-info'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .single()
      if (error) throw error
      return data
    },
    staleTime: 3600000,
  })
}

function useOrgMembers() {
  return useQuery({
    queryKey: ['org-members'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('user_org_memberships')
        .select('*, users(email, full_name, role)')
        .order('created_at')
      if (error) throw error
      return data
    },
    staleTime: 3600000,
  })
}

export default function SettingsPage() {
  const { data: org, isLoading: isLoadingOrg } = useOrgInfo()
  const { data: members, isLoading: isLoadingMembers } = useOrgMembers()

  if (isLoadingOrg) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-violet-400" />
          <h1 className="text-3xl font-bold text-white">Paramètres</h1>
        </div>
        <p className="text-white/60">Informations de votre organisation</p>
      </div>

      <div className="space-y-6">
        {/* Organization Info */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-semibold text-white">Organisation</h2>
          </div>

          {org ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-white/60 mb-1">Nom</p>
                <p className="text-white font-medium">{org.name}</p>
              </div>
              <div>
                <p className="text-xs text-white/60 mb-1">Slug</p>
                <p className="text-white font-medium">{org.slug}</p>
              </div>
              {org.industry && (
                <div>
                  <p className="text-xs text-white/60 mb-1">Secteur</p>
                  <p className="text-white font-medium">{org.industry}</p>
                </div>
              )}
              {org.billing_email && (
                <div>
                  <p className="text-xs text-white/60 mb-1">Email de facturation</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-white/40" />
                    <p className="text-white font-medium">{org.billing_email}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-white/40">Aucune organisation trouvée</p>
          )}
        </div>

        {/* Members */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Membres</h2>
          </div>

          {isLoadingMembers ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            </div>
          ) : members && members.length > 0 ? (
            <div className="space-y-3">
              {members.map((member: any) => {
                const user = member.users as { email: string; full_name: string | null; role: string | null } | null
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div>
                      <p className="text-sm text-white font-medium">
                        {user?.full_name || user?.email || 'Utilisateur'}
                      </p>
                      {user?.email && (
                        <p className="text-xs text-white/50">{user.email}</p>
                      )}
                    </div>
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-violet-500/20 text-violet-400">
                      {member.permission_level}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-white/40">Aucun membre trouvé</p>
          )}
        </div>
      </div>
    </div>
  )
}
