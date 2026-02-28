'use client'

import type { LucideIcon } from 'lucide-react'
import { BarChart3, ChevronRight, Home, Sparkles, Target, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface DashboardBreadcrumbProps {
  title?: string
}

interface BreadcrumbItem {
  label: string
  href: string
  icon: LucideIcon
  active: boolean
  color?: string
}

/**
 * Dashboard Breadcrumb Component
 * Displays hierarchical navigation based on current path
 */
export function DashboardBreadcrumb({ title }: DashboardBreadcrumbProps) {
  const pathname = usePathname()

  // Parse current path to build breadcrumb
  const pathSegments = pathname.split('/').filter(Boolean)

  // Agent type configuration
  const agentConfig = {
    louis: { name: 'Louis', icon: Users, color: 'text-blue-400' },
    arthur: { name: 'Arthur', icon: Target, color: 'text-orange-400' },
    alexandra: { name: 'Alexandra', icon: Sparkles, color: 'text-green-400' },
  }

  // Build breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      active: pathname === '/dashboard',
    },
  ]

  // Add agent type if present
  if (pathSegments.length >= 2) {
    const agentType = pathSegments[1] as 'louis' | 'arthur' | 'alexandra'
    const config = agentConfig[agentType]

    if (config) {
      breadcrumbItems.push({
        label: config.name,
        href: `/dashboard/${agentType}`,
        icon: config.icon,
        active: pathname === `/dashboard/${agentType}`,
        color: config.color,
      })
    }
  }

  // Add custom title if provided
  if (title && pathSegments.length >= 3) {
    breadcrumbItems.push({
      label: title,
      href: pathname,
      icon: BarChart3,
      active: true,
    })
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      {breadcrumbItems.map((item, index) => {
        const Icon = item.icon
        const isLast = index === breadcrumbItems.length - 1

        return (
          <div key={item.href} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="w-4 h-4 text-white/40" />}

            {isLast ? (
              <div className="flex items-center gap-2 text-white font-medium">
                <Icon className={cn('w-4 h-4', item.color)} />
                <span>{item.label}</span>
              </div>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-2 transition-colors hover:text-white',
                  item.active ? 'text-white' : 'text-white/60',
                )}
              >
                <Icon className={cn('w-4 h-4', item.color)} />
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
