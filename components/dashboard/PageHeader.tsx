'use client'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

/**
 * Simple Page Header Component
 * Displays page title and optional description
 * Actions can be passed as children (e.g., export button)
 */
export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && <p className="text-sm text-white/60 mt-1">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  )
}
