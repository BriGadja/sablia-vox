'use client'

import * as m from 'motion/react-m'
import { duration, ease, stagger } from '@/lib/motion-tokens'

interface StaggerChildrenProps {
  children: React.ReactNode
  staggerDelay?: number
  className?: string
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger.default,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: ease.default },
  },
}

export function StaggerChildren({
  children,
  staggerDelay = stagger.default,
  className,
}: StaggerChildrenProps) {
  const variants =
    staggerDelay === stagger.default
      ? containerVariants
      : {
          hidden: {},
          visible: {
            transition: { staggerChildren: staggerDelay },
          },
        }

  return (
    <m.div initial="hidden" animate="visible" variants={variants} className={className}>
      {children}
    </m.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <m.div variants={itemVariants} className={className}>
      {children}
    </m.div>
  )
}
