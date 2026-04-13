'use client'

import * as m from 'motion/react-m'
import { duration, ease } from '@/lib/motion-tokens'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeIn({
  children,
  delay = 0,
  duration: dur = duration.normal,
  className,
}: FadeInProps) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: dur, delay, ease: ease.default }}
      className={className}
    >
      {children}
    </m.div>
  )
}
