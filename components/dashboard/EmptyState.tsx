'use client'

import {
  AlertCircle,
  BarChart2,
  Calendar,
  FileText,
  type LucideIcon,
  Phone,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react'
import { memo } from 'react'

// Pre-defined empty state configurations
export type EmptyStateVariant =
  | 'no-data'
  | 'no-calls'
  | 'no-results'
  | 'no-clients'
  | 'no-agents'
  | 'no-appointments'
  | 'error'
  | 'loading-error'

interface EmptyStateConfig {
  icon: LucideIcon
  title: string
  description: string
  iconColor: string
}

const variantConfigs: Record<EmptyStateVariant, EmptyStateConfig> = {
  'no-data': {
    icon: BarChart2,
    title: 'Aucune donnée disponible',
    description: 'Aucune donnée ne correspond aux filtres sélectionnés.',
    iconColor: 'text-gray-400',
  },
  'no-calls': {
    icon: Phone,
    title: 'Aucun appel',
    description: 'Aucun appel enregistré pour cette période.',
    iconColor: 'text-blue-400',
  },
  'no-results': {
    icon: Search,
    title: 'Aucun résultat',
    description: 'Essayez de modifier vos critères de recherche.',
    iconColor: 'text-yellow-400',
  },
  'no-clients': {
    icon: Users,
    title: 'Aucun client',
    description: 'Aucun client disponible pour cette vue.',
    iconColor: 'text-violet-400',
  },
  'no-agents': {
    icon: Users,
    title: 'Aucun agent',
    description: 'Aucun agent déployé pour cette période.',
    iconColor: 'text-teal-400',
  },
  'no-appointments': {
    icon: Calendar,
    title: 'Aucun rendez-vous',
    description: 'Aucun rendez-vous pris sur cette période.',
    iconColor: 'text-green-400',
  },
  error: {
    icon: AlertCircle,
    title: 'Une erreur est survenue',
    description: 'Impossible de charger les données. Veuillez réessayer.',
    iconColor: 'text-red-400',
  },
  'loading-error': {
    icon: AlertCircle,
    title: 'Erreur de chargement',
    description: 'Une erreur est survenue lors du chargement des données.',
    iconColor: 'text-orange-400',
  },
}

interface EmptyStateProps {
  /** Pre-defined variant or custom configuration */
  variant?: EmptyStateVariant
  /** Custom icon (overrides variant icon) */
  icon?: LucideIcon
  /** Custom title (overrides variant title) */
  title?: string
  /** Custom description (overrides variant description) */
  description?: string
  /** Custom icon color class (overrides variant color) */
  iconColor?: string
  /** Optional action button */
  action?: {
    label: string
    onClick: () => void
  }
  /** Container size: sm, md, lg */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
}

const sizeClasses = {
  sm: {
    container: 'py-6',
    icon: 'w-8 h-8',
    title: 'text-sm',
    description: 'text-xs',
  },
  md: {
    container: 'py-10',
    icon: 'w-12 h-12',
    title: 'text-base',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16',
    icon: 'w-16 h-16',
    title: 'text-lg',
    description: 'text-base',
  },
}

function EmptyStateInner({
  variant = 'no-data',
  icon: customIcon,
  title: customTitle,
  description: customDescription,
  iconColor: customIconColor,
  action,
  size = 'md',
  className = '',
}: EmptyStateProps) {
  const config = variantConfigs[variant]
  const Icon = customIcon || config.icon
  const title = customTitle || config.title
  const description = customDescription || config.description
  const iconColor = customIconColor || config.iconColor
  const sizes = sizeClasses[size]

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${sizes.container} ${className}`}
    >
      <div className={`${iconColor} mb-3 opacity-60`}>
        <Icon className={sizes.icon} />
      </div>
      <h3 className={`font-medium text-white mb-1 ${sizes.title}`}>{title}</h3>
      <p className={`text-gray-400 max-w-xs ${sizes.description}`}>{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

/**
 * Memoized EmptyState component for consistent empty state displays
 * Use variants for common cases or customize with individual props
 *
 * @example
 * // Using variant
 * <EmptyState variant="no-calls" />
 *
 * @example
 * // Custom with action
 * <EmptyState
 *   variant="no-data"
 *   title="Custom title"
 *   action={{ label: "Retry", onClick: handleRetry }}
 * />
 *
 * @example
 * // Fully custom
 * <EmptyState
 *   icon={CustomIcon}
 *   title="Custom empty state"
 *   description="Custom description"
 *   iconColor="text-pink-400"
 *   size="lg"
 * />
 */
export const EmptyState = memo(EmptyStateInner)

/**
 * Wrapper for charts that shows EmptyState when data is empty
 */
interface ChartEmptyWrapperProps {
  data: unknown[] | null | undefined
  isLoading?: boolean
  children: React.ReactNode
  variant?: EmptyStateVariant
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function ChartEmptyWrapperInner({
  data,
  isLoading = false,
  children,
  variant = 'no-data',
  size = 'md',
  className = '',
}: ChartEmptyWrapperProps) {
  // Show loading state
  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center ${sizeClasses[size].container} ${className}`}
      >
        <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Show empty state if no data
  if (!data || data.length === 0) {
    return <EmptyState variant={variant} size={size} className={className} />
  }

  // Render children if data exists
  return <>{children}</>
}

/**
 * Wrapper component that handles loading/empty states for chart data
 *
 * @example
 * <ChartEmptyWrapper data={chartData} isLoading={isLoading} variant="no-calls">
 *   <MyChart data={chartData} />
 * </ChartEmptyWrapper>
 */
export const ChartEmptyWrapper = memo(ChartEmptyWrapperInner)
