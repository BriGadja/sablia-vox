'use client'

import { type HTMLMotionProps, motion } from 'framer-motion'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variants = {
      primary: 'gradient-primary text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/30',
      secondary: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
      ghost: 'bg-transparent hover:bg-white/10 text-white',
    }

    const sizes = {
      sm: 'py-2 px-4 text-sm',
      md: 'py-3 px-6 text-base',
      lg: 'py-4 px-8 text-lg',
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          'group relative overflow-hidden font-semibold rounded-xl transition-all duration-300 ease-out transform active:scale-95',
          variants[variant],
          sizes[size],
          className,
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        {variant === 'primary' && (
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3, originX: 0 }}
          />
        )}
      </motion.button>
    )
  },
)

Button.displayName = 'Button'

export default Button
