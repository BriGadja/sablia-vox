# Autoresearch Baseline — Sablia Vox

> Captured: 2026-04-13. Baseline for `/autoresearch` continuous improvement.
> Updated after Unit 6 (vox-saas-polish) completion.

## Build Metrics

| Metric | Value | Gate |
|--------|-------|------|
| TypeScript errors (tsc) | 0 | Must be 0 |
| Biome lint errors | 0 | Must be 0 |
| Build status | Success | Must pass |
| Total routes | 24 (10 static, 14 dynamic) | — |
| Static bundle (.next/static/) | ~3.0 MB | Constraint: must not increase |

## Code Quality

| Metric | Value | Notes |
|--------|-------|-------|
| `any` types remaining | ~6 | 2 files (vitest.setup.tsx, useSessionStorage.ts) |
| Explicit `biome-ignore` | ~15 | Env var assertions, skeleton arrays |
| Test coverage | 0% | M4 tech debt — no tests yet |
| Dead code | Minimal | Phase A + D cleanup |

## Lighthouse Scores (Targets)

> Scores to be captured on first deployed verification against vox.sablia.io.
> Lighthouse requires a running deployment — targets below are plan goals.

| Page | Performance | Accessibility | SEO | Best Practices |
|------|-------------|---------------|-----|----------------|
| Landing (/) | >= 90 | >= 90 | >= 90 | — |
| Dashboard (/dashboard/overview) | >= 85 | >= 90 | — | — |

## Core Web Vitals (Targets)

| Metric | Landing | Dashboard | Target |
|--------|---------|-----------|--------|
| LCP | TBD | TBD | < 2500ms |
| CLS | TBD | TBD | < 0.1 |
| INP | TBD | TBD | < 200ms |

## Architecture Metrics

| Component | Files | Lines (approx) |
|-----------|-------|----------------|
| Skeleton components | 8 (7 + index) | ~280 |
| CTAFormCore (shared) | 2 (core + index) | ~250 |
| CallDetailContent (shared) | 3 (content + hook + index) | ~400 |
| Chart config | 1 | ~20 |
| Motion primitives | 7 (6 + index) | ~150 |

## Deterministic Metrics for Autoresearch

- **Primary objective**: Lighthouse Performance score (landing page)
- **Secondary objective**: Lighthouse Accessibility score
- **Constraints** (must not regress):
  - Bundle size (total static JS)
  - TypeScript errors: 0
  - Biome lint errors: 0
  - Build success
- **Future metrics** (when tests exist):
  - Vitest pass rate (0-100%)
  - Test coverage percentage
