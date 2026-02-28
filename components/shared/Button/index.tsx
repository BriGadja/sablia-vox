import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
  children?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, children, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center rounded-lg font-semibold transition-all',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500',
      {
        'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/50':
          variant === 'primary',
        'bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm': variant === 'secondary',
        'border-2 border-white/20 hover:border-white/40 text-white bg-transparent':
          variant === 'outline',
        'px-4 py-2 text-sm': size === 'sm',
        'px-6 py-3 text-base': size === 'md',
        'px-8 py-4 text-lg': size === 'lg',
      },
      className,
    )

    if (asChild && children) {
      return <span className={classes}>{children}</span>
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
