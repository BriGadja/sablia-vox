# Sablia Vox — Config & Dependencies Cleanup (Unit 2)

## Context

Unit 2 of the sablia-vox refactoring master plan (`sablia-vox-refactor-master.md`). Unit 1 (dead code removal) is complete. This unit cleans up config issues and dependency problems.

**4 of 7 original tasks are already resolved** (ESLint removal, Tremor cleanup, ContactModal deleted). This unit focuses on the 3 remaining items: DevTools in prod, hardcoded webhooks, and env var setup.

## Phase Status

| Phase | Name | Tasks |
|-------|------|-------|
| A | Fix DevTools production leak | 2 |
| B | Extract webhook URLs to env vars | 4 |
| C | Update docs & validate | 2 |

---

## Phase A: Fix DevTools Production Leak

Resolves TECH_DEBT C2 — `@tanstack/react-query-devtools` is in `dependencies` and unconditionally rendered.

### Tasks

- [ ] A1: Move `@tanstack/react-query-devtools` from `dependencies` to `devDependencies` in `package.json`
- [ ] A2: Add dev-only dynamic import in `app/providers.tsx`

### Technical Details

**A1** — `package.json:29`: move line to `devDependencies` section.

**A2** — `app/providers.tsx`: Replace the static import + unconditional render with a lazy-loaded dev-only component:

```tsx
// Remove: import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import dynamic from 'next/dynamic'

const ReactQueryDevtools = dynamic(
  () =>
    import('@tanstack/react-query-devtools').then((mod) => ({
      default: mod.ReactQueryDevtools,
    })),
  { ssr: false },
)

// In JSX — conditional render:
{process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
```

This ensures:
- DevTools JS is never included in the production bundle (tree-shaken by Next.js)
- No SSR attempt for DevTools
- Package in devDependencies won't cause build failure because the dynamic import is gated behind the dev check

---

## Phase B: Extract Webhook URLs to Environment Variables

Resolves TECH_DEBT H2 and M9 — hardcoded webhook URLs in 3 files.

### Tasks

- [ ] B1: Add env vars to `.env.example` and `.env.local.example`
- [ ] B2: Update `components/ui/CTAStaticForm.tsx` — use `process.env.NEXT_PUBLIC_CTA_WEBHOOK_URL`
- [ ] B3: Update `components/ui/CTAPopupForm.tsx` — use `process.env.NEXT_PUBLIC_CTA_WEBHOOK_URL`
- [ ] B4: Update `lib/constants.ts` — use `process.env.NEXT_PUBLIC_CHATBOT_WEBHOOK_URL`

### Technical Details

**B1** — Add to both `.env.example` and `.env.local.example`:

```env
# Webhook URLs (n8n)
NEXT_PUBLIC_CTA_WEBHOOK_URL=https://n8n.sablia.io/webhook/voipia_louis_from_site
NEXT_PUBLIC_CHATBOT_WEBHOOK_URL=https://n8n.sablia.io/webhook/chatbot-iapreneurs
```

**B2** — `CTAStaticForm.tsx:161`: Replace hardcoded URL:
```tsx
// Before:
const response = await fetch('https://n8n.sablia.io/webhook/voipia_louis_from_site', {
// After:
const response = await fetch(process.env.NEXT_PUBLIC_CTA_WEBHOOK_URL!, {
```

**B3** — `CTAPopupForm.tsx:188`: Same change as B2.

**B4** — `lib/constants.ts:2`: Replace hardcoded URL:
```tsx
// Before:
webhookUrl: 'https://n8n.sablia.io/webhook/chatbot-iapreneurs',
// After:
webhookUrl: process.env.NEXT_PUBLIC_CHATBOT_WEBHOOK_URL || 'https://n8n.sablia.io/webhook/chatbot-iapreneurs',
```

Note: chatbot uses `||` fallback because `constants.ts` is imported at module level and env vars may not be available in all contexts. CTA forms use `!` assertion since they're only called in client event handlers where env is always available.

---

## Phase C: Update Docs & Validate

### Tasks

- [ ] C1: Update `docs/TECH_DEBT.md` — mark C2, H2, M9 as resolved
- [ ] C2: Run `/validate` — build + lint + type-check must pass

---

## Files Modified

| File | Phase | Change |
|------|-------|--------|
| `package.json` | A1 | Move devtools to devDependencies |
| `app/providers.tsx` | A2 | Dynamic import + dev-only render |
| `.env.example` | B1 | Add webhook env vars |
| `.env.local.example` | B1 | Add webhook env vars |
| `components/ui/CTAStaticForm.tsx` | B2 | Use env var for webhook URL |
| `components/ui/CTAPopupForm.tsx` | B3 | Use env var for webhook URL |
| `lib/constants.ts` | B4 | Use env var for chatbot webhook URL |
| `docs/TECH_DEBT.md` | C1 | Mark items resolved |

## Documentation Sources & Targets

| Document | Role | Update scope |
|----------|------|-------------|
| `docs/TECH_DEBT.md` | Source + Target | Phase C — mark C2, H2, M9 resolved |
| `.claude/plans/sablia-vox-refactor-master.md` | Source | Reference only — no changes |
| `CLAUDE.md` | Source | No changes needed |

## Validation Strategy

**Type**: automated
**Confidence before validation**: 9/10

### Acceptance Criteria

- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes (Biome)
- [ ] `npm run type-check` passes
- [ ] No hardcoded `n8n.sablia.io/webhook/` URLs in `components/ui/CTA*.tsx` or `lib/constants.ts`
- [ ] `@tanstack/react-query-devtools` is in `devDependencies`, not `dependencies`
- [ ] `ReactQueryDevtools` only loads in development mode

### Validation Steps

| # | Method | What it checks | Pass condition |
|---|--------|---------------|----------------|
| 1 | `npm run build` | Production build succeeds without DevTools | Exit 0 |
| 2 | `npm run lint` | No Biome errors | Exit 0 |
| 3 | `npm run type-check` | TypeScript compiles | Exit 0 |
| 4 | `grep -r "n8n.sablia.io/webhook" components/ lib/constants.ts` | No hardcoded URLs remain | No matches |
| 5 | `grep "react-query-devtools" package.json` | Package in devDependencies only | Line appears under devDependencies |

### Iteration Protocol

If validation fails:
1. Identify which acceptance criteria failed
2. Fix the root cause (do NOT patch around it)
3. Re-run all validation steps
4. Repeat until all criteria pass

## Post-Unit: Vercel Deployment Note

The new `NEXT_PUBLIC_CTA_WEBHOOK_URL` and `NEXT_PUBLIC_CHATBOT_WEBHOOK_URL` env vars must be added to Vercel project settings before deploying. Current values:
- `NEXT_PUBLIC_CTA_WEBHOOK_URL` = `https://n8n.sablia.io/webhook/voipia_louis_from_site`
- `NEXT_PUBLIC_CHATBOT_WEBHOOK_URL` = `https://n8n.sablia.io/webhook/chatbot-iapreneurs`
