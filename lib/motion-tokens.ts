// lib/motion-tokens.ts — JS mirror of CSS animation tokens
// CSS vars in globals.css are canonical; this file mirrors them for Motion's JS transition API

export const duration = {
  instant: 0.05,
  fast: 0.1,
  normal: 0.2,
  moderate: 0.3,
  slow: 0.4,
  xslow: 0.6,
} as const

export const ease = {
  default: [0.4, 0, 0.2, 1],
  in: [0.4, 0, 1, 1],
  out: [0, 0, 0.2, 1],
  spring: [0.34, 1.56, 0.64, 1],
} as const

export const spring = {
  gentle: { type: 'spring' as const, stiffness: 200, damping: 20 },
  snappy: { type: 'spring' as const, stiffness: 300, damping: 25 },
  bouncy: { type: 'spring' as const, stiffness: 400, damping: 15 },
} as const

export const stagger = {
  default: 0.05,
  fast: 0.03,
  slow: 0.08,
} as const
