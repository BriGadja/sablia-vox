'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

/**
 * Route label mapping for dashboard breadcrumbs
 */
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  louis: 'Louis',
  performance: 'Performance',
  agents: 'Agents',
  billing: 'Facturation',
  costs: 'Coûts',
  clients: 'Clients',
  settings: 'Paramètres',
  financial: 'Financier',
}

/**
 * Check if a string looks like a UUID
 */
function isUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

/**
 * Get label for a route segment
 */
function getRouteLabel(segment: string, prevSegment?: string): string {
  // If it's a UUID, show a more friendly label based on context
  if (isUUID(segment)) {
    if (prevSegment === 'agents') return 'Details'
    if (prevSegment === 'clients') return 'Details'
    return 'Details'
  }
  return routeLabels[segment.toLowerCase()] || segment.charAt(0).toUpperCase() + segment.slice(1)
}

/**
 * Dynamic Breadcrumb Component
 * Automatically generates breadcrumbs based on current path
 */
export function DynamicBreadcrumb() {
  const pathname = usePathname()

  // Split pathname into segments, filtering empty strings
  const segments = pathname.split('/').filter(Boolean)

  // Don't show breadcrumbs if we're just at /dashboard
  if (segments.length <= 1) {
    return null
  }

  // Build breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const isLast = index === segments.length - 1
    const prevSegment = index > 0 ? segments[index - 1] : undefined
    const label = getRouteLabel(segment, prevSegment)

    return {
      href,
      label,
      isLast,
    }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={crumb.href}>
            {index > 0 && <BreadcrumbSeparator className="text-white/30" />}
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage className="text-white/90">{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    href={crumb.href}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
