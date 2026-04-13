'use client'

import * as m from 'motion/react-m'
import { duration, ease } from '@/lib/motion-tokens'

interface FadeInWhenVisibleProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeInWhenVisible({
  children,
  delay = 0,
  duration: dur = duration.normal,
  className,
}: FadeInWhenVisibleProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: dur, delay, ease: ease.default }}
      className={className}
    >
      {children}
    </m.div>
  )
}
