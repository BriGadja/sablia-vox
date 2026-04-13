/**
 * Shared chart style constants for Recharts components.
 * Used across all dashboard charts for visual consistency.
 */

/** Standard axis tick style (XAxis/YAxis) */
export const CHART_AXIS_STYLE = { fontSize: '11px' } as const

/** Alternative axis tick style (used where 12px is preferred) */
export const CHART_AXIS_STYLE_LG = { fontSize: '12px' } as const

/** Standard tooltip content wrapper */
export const CHART_TOOLTIP_CONTENT_STYLE = {
  backgroundColor: 'rgba(0,0,0,0.95)',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: '8px',
  padding: '8px 12px',
} as const

/** Standard tooltip label style */
export const CHART_TOOLTIP_LABEL_STYLE = {
  color: '#fff',
  fontWeight: 'bold',
  marginBottom: '4px',
} as const

/** Standard tooltip item style */
export const CHART_TOOLTIP_ITEM_STYLE = {
  color: '#fff',
} as const

/** Standard axis stroke color */
export const CHART_AXIS_STROKE = 'rgba(255,255,255,0.6)' as const

/** Subtle axis stroke color (for secondary axes) */
export const CHART_AXIS_STROKE_SUBTLE = 'rgba(255,255,255,0.3)' as const

/** Standard CartesianGrid stroke */
export const CHART_GRID_STROKE = 'rgba(255,255,255,0.1)' as const
