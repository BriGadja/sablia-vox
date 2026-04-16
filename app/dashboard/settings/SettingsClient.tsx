'use client'

import { useQueryClient } from '@tanstack/react-query'
import {
  Building2,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  Mail,
  MoreHorizontal,
  Settings,
  Shield,
  Trash2,
  UserCog,
  UserPlus,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useOrgMembers } from '@/lib/hooks/useOrgMembers'
import type { OrgMember, OrgProfile, PermissionLevel } from '@/lib/types/settings'
import { cn } from '@/lib/utils'

const INDUSTRIES = [
  'Immobilier',
  'Automobile',
  'Assurance',
  'Santé',
  'Services',
  'Commerce',
  'Autre',
] as const

const ROLE_STYLES: Record<PermissionLevel, string> = {
  admin: 'bg-violet-500/20 text-violet-400',
  write: 'bg-blue-500/20 text-blue-400',
  read: 'bg-white/10 text-white/60',
}

const ROLE_LABELS: Record<PermissionLevel, string> = {
  admin: 'Administrateur',
  write: 'Éditeur',
  read: 'Lecteur',
}

interface SettingsClientProps {
  org: OrgProfile | null
  orgId: string | null
  isAdmin: boolean
}

export default function SettingsClient({ org, orgId, isAdmin }: SettingsClientProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 page-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-violet-400" />
          <h1 className="text-3xl font-bold text-white">Paramètres</h1>
        </div>
        <p className="text-white/60">
          {isAdmin
            ? 'Gérez votre organisation et votre équipe'
            : 'Informations de votre organisation'}
        </p>
      </div>

      <Tabs defaultValue="organisation" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger
            value="organisation"
            className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Organisation
          </TabsTrigger>
          <TabsTrigger
            value="equipe"
            className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400"
          >
            <Users className="w-4 h-4 mr-2" />
            Équipe
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger
              value="debug"
              className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-400"
            >
              <UserCog className="w-4 h-4 mr-2" />
              Debug
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="organisation">
          {isAdmin ? <OrgEditForm org={org} /> : <OrgReadOnly org={org} />}
        </TabsContent>

        <TabsContent value="equipe">
          <TeamTab orgId={orgId} isAdmin={isAdmin} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="debug">
            <ImpersonatePanel />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

// --- Organisation Tab: Read-Only ---

function OrgReadOnly({ org }: { org: OrgProfile | null }) {
  if (!org) return <p className="text-white/40">Aucune organisation trouvée</p>

  const fields = [
    { label: 'Nom', value: org.name },
    { label: 'Slug', value: org.slug },
    { label: 'Secteur', value: org.industry },
    { label: 'Email de facturation', value: org.billing_email, icon: Mail },
  ]

  return (
    <div className="rounded-xl glass-subtle p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((field) =>
          field.value ? (
            <div key={field.label}>
              <p className="text-xs text-white/60 mb-1">{field.label}</p>
              <div className="flex items-center gap-2">
                {field.icon && <field.icon className="w-4 h-4 text-white/40" />}
                <p className="text-white font-medium">{field.value}</p>
              </div>
            </div>
          ) : null,
        )}
      </div>
    </div>
  )
}

// --- Organisation Tab: Editable Form ---

function OrgEditForm({ org }: { org: OrgProfile | null }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(org?.name ?? '')
  const [billingEmail, setBillingEmail] = useState(org?.billing_email ?? '')
  const [industry, setIndustry] = useState(org?.industry ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const res = await fetch('/api/org/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || undefined,
          billing_email: billingEmail || undefined,
          industry: industry || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la mise à jour')
        return
      }

      await queryClient.invalidateQueries({ queryKey: ['org-info'] })
      toast.success('Organisation mise à jour')
    } catch (_err) {
      toast.error('Erreur lors de la mise à jour')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-xl glass-subtle p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="org-name" className="block text-sm font-medium text-white/80 mb-2">
              Nom de l&apos;organisation
            </label>
            <input
              id="org-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="billing-email" className="block text-sm font-medium text-white/80 mb-2">
              Email de facturation
            </label>
            <input
              id="billing-email"
              type="email"
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all disabled:opacity-50"
              placeholder="facturation@example.com"
            />
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-white/80 mb-2">
              Secteur d&apos;activité
            </label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              disabled={isSaving}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all disabled:opacity-50"
            >
              <option value="" className="bg-gray-900">
                Sélectionner...
              </option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind} className="bg-gray-900">
                  {ind}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm font-medium text-white/80 mb-2">Slug</p>
            <p className="px-4 py-2.5 text-white/60">{org?.slug ?? '—'}</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  )
}

// --- Team Tab ---

function TeamTab({ orgId, isAdmin }: { orgId: string | null; isAdmin: boolean }) {
  const { data: members, isLoading } = useOrgMembers(orgId)

  return (
    <div className="space-y-6">
      {isAdmin && <InviteMemberForm />}

      <div className="rounded-xl glass-subtle p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Membres</h2>
          {members && <span className="text-sm text-white/40">({members.length})</span>}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {['m1', 'm2', 'm3'].map((key) => (
              <Skeleton key={key} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : members && members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} isAdmin={isAdmin} />
            ))}
          </div>
        ) : (
          <p className="text-white/40">Aucun membre trouvé</p>
        )}
      </div>
    </div>
  )
}

// --- Member Card ---

function MemberCard({ member, isAdmin }: { member: OrgMember; isAdmin: boolean }) {
  const user = member.users
  const displayName = user?.full_name || user?.email || 'Utilisateur'
  const initials = getInitials(displayName)

  return (
    <div className="flex items-center justify-between p-3 rounded-lg glass-subtle">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-violet-500/20 text-violet-400 text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm text-white font-medium">{displayName}</p>
          {user?.email && user.full_name && <p className="text-xs text-white/50">{user.email}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={cn(
            'px-2.5 py-1 rounded-md text-xs font-medium',
            ROLE_STYLES[member.permission_level],
          )}
        >
          {ROLE_LABELS[member.permission_level]}
        </span>
        {isAdmin && <MemberActions member={member} />}
      </div>
    </div>
  )
}

// --- Member Actions Dropdown ---

function MemberActions({ member }: { member: OrgMember }) {
  const queryClient = useQueryClient()
  const [isChangingRole, setIsChangingRole] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRoleChange = async (newRole: PermissionLevel) => {
    setIsChangingRole(true)
    try {
      const res = await fetch('/api/org/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_role', memberId: member.id, role: newRole }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors du changement de rôle')
        return
      }

      await queryClient.invalidateQueries({ queryKey: ['org-members'] })
      toast.success(`Rôle changé en ${ROLE_LABELS[newRole]}`)
    } catch (_err) {
      toast.error('Erreur lors du changement de rôle')
    } finally {
      setIsChangingRole(false)
    }
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      const res = await fetch('/api/org/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', memberId: member.id }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Erreur lors de la suppression')
        return
      }

      await queryClient.invalidateQueries({ queryKey: ['org-members'] })
      toast.success('Membre retiré')
    } catch (_err) {
      toast.error('Erreur lors de la suppression')
    } finally {
      setIsRemoving(false)
    }
  }

  const displayName = member.users?.full_name || member.users?.email || 'ce membre'

  return (
    <Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            disabled={isChangingRole || isRemoving}
          >
            {isChangingRole || isRemoving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MoreHorizontal className="w-4 h-4" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-gray-900 border-white/10">
          <div className="px-2 py-1.5 text-xs text-white/40">Changer le rôle</div>
          {(['admin', 'write', 'read'] as const).map((role) => (
            <DropdownMenuItem
              key={role}
              onClick={() => handleRoleChange(role)}
              disabled={member.permission_level === role}
              className="text-white/80 focus:text-white focus:bg-white/10"
            >
              <Shield className="w-3.5 h-3.5 mr-2" />
              {ROLE_LABELS[role]}
              {member.permission_level === role && (
                <Check className="w-3.5 h-3.5 ml-auto text-violet-400" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="bg-white/10" />
          <DialogTrigger asChild>
            <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Retirer de l&apos;organisation
            </DropdownMenuItem>
          </DialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent className="bg-gray-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Retirer {displayName} ?</DialogTitle>
          <DialogDescription className="text-white/60">
            Êtes-vous sûr de vouloir retirer {displayName} de l&apos;organisation ? Cette action est
            irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <DialogClose asChild>
            <button
              type="button"
              className="px-4 py-2 rounded-lg border border-white/10 text-white/80 hover:bg-white/5 transition-colors"
            >
              Annuler
            </button>
          </DialogClose>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-medium transition-colors flex items-center gap-2"
          >
            {isRemoving && <Loader2 className="w-4 h-4 animate-spin" />}
            Retirer
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// --- Invite Member Form ---

function InviteMemberForm() {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<PermissionLevel>('read')
  const [isInviting, setIsInviting] = useState(false)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setIsInviting(true)

    try {
      const res = await fetch('/api/org/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'invite', email, role }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Erreur lors de l'invitation")
        return
      }

      await queryClient.invalidateQueries({ queryKey: ['org-members'] })
      toast.success('Invitation envoyée !')
      setEmail('')
      setRole('read')
    } catch (_err) {
      toast.error("Erreur lors de l'invitation")
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className="rounded-xl glass-subtle p-6">
      <div className="flex items-center gap-3 mb-4">
        <UserPlus className="w-5 h-5 text-violet-400" />
        <h2 className="text-lg font-semibold text-white">Inviter un membre</h2>
      </div>
      <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isInviting}
          placeholder="email@example.com"
          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all disabled:opacity-50"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as PermissionLevel)}
          disabled={isInviting}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all disabled:opacity-50"
        >
          <option value="read" className="bg-gray-900">
            Lecteur
          </option>
          <option value="write" className="bg-gray-900">
            Éditeur
          </option>
          <option value="admin" className="bg-gray-900">
            Administrateur
          </option>
        </select>
        <button
          type="submit"
          disabled={isInviting || !email}
          className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isInviting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          Inviter
        </button>
      </form>
    </div>
  )
}

// --- Impersonate Panel (admin-only) ---

interface ImpersonateUser {
  id: string
  email: string
  full_name: string | null
  orgs: Array<{ org_id: string; permission_level: string }>
}

function ImpersonatePanel() {
  const [users, setUsers] = useState<ImpersonateUser[] | null>(null)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [selectedEmail, setSelectedEmail] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [generatedFor, setGeneratedFor] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/users')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed')
        const data = (await res.json()) as { users: ImpersonateUser[] }
        if (!cancelled) setUsers(data.users)
      })
      .catch(() => {
        if (!cancelled) {
          setUsers([])
          toast.error('Impossible de charger les utilisateurs')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingUsers(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleGenerate = async () => {
    if (!selectedEmail) return
    setIsGenerating(true)
    setGeneratedLink(null)
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: selectedEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la génération')
        return
      }
      setGeneratedLink(data.action_link)
      setGeneratedFor(data.impersonated_email)
      toast.success('Lien généré')
    } catch (_err) {
      toast.error('Erreur lors de la génération')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedLink) return
    await navigator.clipboard.writeText(generatedLink)
    toast.success('Lien copié')
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl glass-subtle p-6">
        <div className="flex items-center gap-3 mb-2">
          <UserCog className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Se connecter en tant que</h2>
        </div>
        <p className="text-sm text-white/60 mb-6">
          Génère un lien magique pour se connecter en tant qu&apos;un autre utilisateur. Utilisez la
          navigation privée pour ne pas écraser votre session. Chaque utilisation est enregistrée.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <select
            value={selectedEmail}
            onChange={(e) => setSelectedEmail(e.target.value)}
            disabled={isLoadingUsers || isGenerating}
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent transition-all disabled:opacity-50"
          >
            <option value="" className="bg-gray-900">
              {isLoadingUsers ? 'Chargement...' : 'Sélectionner un utilisateur'}
            </option>
            {users?.map((u) => (
              <option key={u.id} value={u.email} className="bg-gray-900">
                {u.full_name ? `${u.full_name} — ${u.email}` : u.email}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!selectedEmail || isGenerating}
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserCog className="w-4 h-4" />
            )}
            Générer le lien
          </button>
        </div>

        {generatedLink && (
          <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4 space-y-3">
            <p className="text-sm text-white/80">
              Lien pour <span className="font-medium text-violet-300">{generatedFor}</span> — à
              ouvrir en navigation privée :
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-md text-xs text-white/70 font-mono truncate">
                {generatedLink}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="p-2 rounded-md border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Copier le lien"
              >
                <Copy className="w-4 h-4" />
              </button>
              <a
                href={generatedLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-md border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-white/40">
              Le lien est à usage unique. Ouvrez-le dans une fenêtre de navigation privée pour
              préserver votre session admin.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// --- Helpers ---

function getInitials(name: string): string {
  return name
    .split(/[\s@]+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
