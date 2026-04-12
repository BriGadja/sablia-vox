import { z } from 'zod'

// --- Permission levels ---

export const permissionLevels = ['read', 'write', 'admin'] as const
export type PermissionLevel = (typeof permissionLevels)[number]

// --- Org profile ---

export interface OrgProfile {
  id: string
  name: string
  slug: string
  industry: string | null
  billing_email: string | null
  settings: Record<string, unknown> | null
  is_active: boolean | null
}

// --- Org member (with joined user data) ---

export interface OrgMember {
  id: string
  user_id: string
  org_id: string
  permission_level: PermissionLevel
  is_default: boolean | null
  created_at: string | null
  users: {
    email: string
    full_name: string | null
    role: string | null
    avatar_url: string | null
  } | null
}

// --- API request schemas ---

export const updateOrgSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  billing_email: z.string().email().optional(),
  industry: z.string().max(100).optional(),
})
export type UpdateOrgInput = z.infer<typeof updateOrgSchema>

export const inviteMemberSchema = z.object({
  action: z.literal('invite'),
  email: z.string().email(),
  role: z.enum(permissionLevels),
})

export const changeRoleSchema = z.object({
  action: z.literal('change_role'),
  memberId: z.string().uuid(),
  role: z.enum(permissionLevels),
})

export const removeMemberSchema = z.object({
  action: z.literal('remove'),
  memberId: z.string().uuid(),
})

export const memberActionSchema = z.discriminatedUnion('action', [
  inviteMemberSchema,
  changeRoleSchema,
  removeMemberSchema,
])
export type MemberActionInput = z.infer<typeof memberActionSchema>
