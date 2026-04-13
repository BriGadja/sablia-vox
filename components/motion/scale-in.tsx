'use client'

import * as m from 'motion/react-m'
import { duration, ease } from '@/lib/motion-tokens'

interface ScaleInProps {
  children: React.ReactNode
  scale?: number
  delay?: number
  duration?: number
  className?: string
}

export function ScaleIn({
  children,
  scale = 0.9,
  delay = 0,
  duration: dur = duration.normal,
  className,
}: ScaleInProps) {
  return (
    <m.div
      initial={{ opacity: 0, scale }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: dur, delay, ease: ease.default }}
      className={className}
    >
      {children}
    </m.div>
  )
}
