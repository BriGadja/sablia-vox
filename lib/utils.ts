import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to relative time in French
 * @param date - Date string or Date object
 * @returns Formatted relative time string (e.g., "Il y a 2h", "Hier")
 */
export function formatRelativeTime(date: string | Date | null): string {
  if (!date) return 'Jamais'

  const now = new Date()
  const past = typeof date === 'string' ? new Date(date) : date
  const diffMs = now.getTime() - past.getTime()

  // Handle future dates
  if (diffMs < 0) return 'Dans le futur'

  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return "À l'instant"
  if (diffMin < 60) return `Il y a ${diffMin}min`
  if (diffHour < 24) return `Il y a ${diffHour}h`
  if (diffDay === 1) return 'Hier'
  if (diffDay < 7) return `Il y a ${diffDay}j`
  if (diffDay < 30) return `Il y a ${Math.floor(diffDay / 7)}sem`
  if (diffDay < 365) return `Il y a ${Math.floor(diffDay / 30)}mois`

  return past.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

/**
 * Deduplicate an array by a key function
 * @param array - Array to deduplicate (can be undefined/null)
 * @param keyFn - Function to extract the unique key from each item
 * @returns Deduplicated array
 */
export function deduplicateBy<T>(
  array: T[] | undefined | null,
  keyFn: (item: T) => string | number,
): T[] {
  if (!array) return []
  const seen = new Set<string | number>()
  return array.filter((item) => {
    const key = keyFn(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Serialize an array for use in React Query keys
 * Creates a stable string representation that won't cause cache misses
 * @param arr - Array of strings to serialize
 * @returns Sorted, comma-separated string
 */
export function serializeQueryKey(arr: string[] | undefined | null): string {
  if (!arr || arr.length === 0) return ''
  return [...arr].sort().join(',')
}

// ============================================================================
// CSV Builder Utilities
// ============================================================================

/**
 * Escape a CSV cell value
 * Handles special characters like commas, quotes, and newlines
 * @param value - Cell value to escape
 * @returns Escaped string ready for CSV
 */
export function escapeCSVCell(value: unknown): string {
  if (value === null || value === undefined) return ''

  const str = String(value)

  // If contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return `"${str}"`
}

/**
 * Column definition for CSV builder
 */
export interface CSVColumn<T> {
  /** Column header label */
  header: string
  /** Function to extract cell value from data row */
  accessor: (row: T) => unknown
  /** Optional formatter for the cell value */
  format?: (value: unknown, row: T) => string
}

/**
 * Build CSV string from data array and column definitions
 * @param data - Array of data objects
 * @param columns - Column definitions with headers and accessors
 * @param options - Optional configuration
 * @returns CSV string with BOM for Excel compatibility
 */
export function buildCSV<T>(
  data: T[],
  columns: CSVColumn<T>[],
  options: {
    /** Include BOM for Excel compatibility (default: true) */
    includeBOM?: boolean
    /** Column separator (default: ',') */
    separator?: string
  } = {},
): string {
  const { includeBOM = true, separator = ',' } = options

  // Build header row
  const headerRow = columns.map((col) => escapeCSVCell(col.header)).join(separator)

  // Build data rows
  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        const rawValue = col.accessor(row)
        const formattedValue = col.format ? col.format(rawValue, row) : rawValue
        return escapeCSVCell(formattedValue)
      })
      .join(separator),
  )

  const csv = [headerRow, ...dataRows].join('\n')

  // Add BOM for Excel compatibility (handles UTF-8 characters properly)
  return includeBOM ? `\ufeff${csv}` : csv
}

/**
 * Download CSV string as a file in the browser
 * @param csv - CSV string content
 * @param filename - Name of the file to download
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

// ============================================================================
// Common CSV Formatters
// ============================================================================

/**
 * Format date for CSV export
 * @param date - Date string or Date object
 * @returns Formatted date string in French locale
 */
export function formatDateForCSV(date: string | Date | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('fr-FR')
}

/**
 * Format boolean for CSV export
 * @param value - Boolean value
 * @returns 'Oui' or 'Non'
 */
export function formatBooleanForCSV(value: boolean | null | undefined): string {
  return value ? 'Oui' : 'Non'
}

/**
 * Format currency for CSV export
 * @param value - Number value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatCurrencyForCSV(
  value: number | null | undefined,
  decimals: number = 2,
): string {
  if (value === null || value === undefined) return ''
  return value.toFixed(decimals)
}
