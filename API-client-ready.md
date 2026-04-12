# API & Auth Reference — Client-Ready SaaS (Unit 3)

> Established in vox-saas-auth-settings (Unit 3 of vox-saas-master).

## Admin Supabase Client

`lib/supabase/admin.ts` — Server-only client using `SUPABASE_SERVICE_ROLE_KEY`. Bypasses RLS. Never import from client components.

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
const admin = createAdminClient()
```

**Required env var**: `SUPABASE_SERVICE_ROLE_KEY` (set in `.env.local` and Vercel dashboard).

## Auth Guard

`lib/api-auth.ts` — `requireAdmin()` verifies session + admin status. Returns `{ userId, orgId }` or throws `ApiError`.

```typescript
import { requireAdmin, handleApiError } from '@/lib/api-auth'

export async function PUT(request: Request) {
  try {
    const { userId, orgId } = await requireAdmin()
    // ... admin-only logic
  } catch (err) {
    return handleApiError(err)
  }
}
```

## API Routes

### PUT `/api/org/update`

Updates organization profile. Admin only.

| Field | Type | Required |
|-------|------|----------|
| name | string (1-200) | optional |
| billing_email | string (email) | optional |
| industry | string (max 100) | optional |

Returns: updated org row.

### POST `/api/org/members`

Three actions via `action` discriminator. Admin only.

**Invite** (`action: 'invite'`):
- `email`: string (email)
- `role`: `'read' | 'write' | 'admin'`
- Uses `inviteUserByEmail()` + INSERT into `user_org_memberships`
- Returns 201 on success, 409 if already member

**Change role** (`action: 'change_role'`):
- `memberId`: string (UUID)
- `role`: `'read' | 'write' | 'admin'`

**Remove** (`action: 'remove'`):
- `memberId`: string (UUID)
- Guards: no self-removal, no removing last admin

## Magic Link Auth

Added to `LoginForm.tsx`. Uses `signInWithOtp({ email, options: { shouldCreateUser: false } })`.

Flow: user enters email -> OTP sent -> email contains link with `token_hash` -> `/auth/callback` verifies via `verifyOtp({ token_hash, type: 'email' })` -> redirect to dashboard.

**Email template prerequisite**: Supabase "Magic Link" template must use `{{ .TokenHash }}` to build `vox.sablia.io/auth/callback?token_hash=...` links.

## Settings Page Pattern

Server Component `page.tsx` (auth check + SSR) -> Client Component `SettingsClient.tsx` (tabs + isAdmin gating).

- Admin: editable org form + team management (invite, role change, remove)
- Non-admin: read-only org info + team list (no actions)

## Type Definitions

`lib/types/settings.ts`: `OrgProfile`, `OrgMember`, `PermissionLevel`, Zod schemas for API validation.

## RLS Constraint

`organizations` and `user_org_memberships` have NO UPDATE/INSERT/DELETE RLS for authenticated users. All mutations MUST go through service_role API routes (not Server Actions, not client-side Supabase calls).
