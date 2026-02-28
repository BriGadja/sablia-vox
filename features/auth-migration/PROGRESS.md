# Sablia Vox - Auth Migration Progress

**Plan**: [.claude/plans/sablia-vox-auth-migration.md](/home/sablia/workspace/.claude/plans/sablia-vox-auth-migration.md)
**Started**: 2026-01-29

---

## Phase Status

| Phase | Name | Status | Started | Completed |
|-------|------|--------|---------|-----------|
| A | Supabase Dashboard Configuration | NOT STARTED | - | - |
| B | Verification Testing | NOT STARTED | - | - |
| C | Code Cleanup (Optional) | NOT STARTED | - | - |

**Current Phase**: A - Waiting for Brice to update Supabase Dashboard
**Blocker**: None

---

## Phase A: Supabase Dashboard Configuration

**Status**: NOT STARTED

### Tasks
- [ ] Update Site URL to `https://vox.sablia.io`
- [ ] Update Redirect URLs allow list
- [ ] Review/update Email Templates (all 5 templates)

### Decisions Made
- (none yet)

### Notes
- Requires Supabase Dashboard access
- Project: Vox (tcpecjoeelbnnvdkvgvg)

---

## Phase B: Verification Testing

**Status**: NOT STARTED

### Tasks
- [ ] Test password reset flow
- [ ] Test login flow
- [ ] Test local development auth

### Decisions Made
- (none yet)

### Notes
- (none yet)

---

## Phase C: Code Cleanup (Optional)

**Status**: NOT STARTED

### Tasks
- [ ] Rename CSS classes from `voipia-*` to `sablia-*`
- [ ] Update chatbot storage key
- [ ] Update DashboardShowcase display URL

### Decisions Made
- (none yet)

### Notes
- Optional phase - can be done later
- Renaming storage key will reset chatbot sessions

---

## Session Log

### 2026-01-29 - Plan Created
**What was done:**
- Analyzed current auth setup
- Found voipia.fr references in codebase (179 files total, but auth is domain-agnostic)
- Identified Supabase Dashboard as main configuration point
- Created plan file

**Decisions:**
- Auth code is already correct (uses window.location.origin)
- Main work is in Supabase Dashboard settings
- Code cleanup is optional (Phase C)

**Next session:**
- Brice to update Supabase Dashboard (Phase A)
- Then test auth flows (Phase B)

---

## Key References

- **Plan**: `.claude/plans/sablia-vox-auth-migration.md`
- **Auth Files**: `app/auth/` directory
- **Supabase Project**: Vox (tcpecjoeelbnnvdkvgvg)
