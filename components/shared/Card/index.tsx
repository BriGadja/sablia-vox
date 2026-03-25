import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient' | 'hover'
}

export function Card({ className, variant = 'default', children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border backdrop-blur-sm transition-all duration-300',
        {
          'bg-white/5 border-white/10': variant === 'default',
          'bg-linear-to-br from-white/10 to-white/5 border-white/20': variant === 'gradient',
          'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 cursor-pointer':
            variant === 'hover',
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
