'use client'

import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { DashboardFilters } from '@/lib/types/dashboard'

interface ExportCSVButtonProps {
  filters: DashboardFilters
  exportFn: (filters: DashboardFilters) => Promise<string>
  filename?: string
  disabled?: boolean
}

/**
 * Export CSV Button Component
 * Generic button for exporting dashboard data to CSV
 * @param filters - Current dashboard filters
 * @param exportFn - Export function to call (from queries)
 * @param filename - Optional custom filename (defaults to "export-{date}.csv")
 * @param disabled - Optional flag to disable the button
 */
export function ExportCSVButton({
  filters,
  exportFn,
  filename,
  disabled = false,
}: ExportCSVButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)

      // Call export function
      const csv = await exportFn(filters)

      // Generate filename if not provided
      const finalFilename = filename || `export-${new Date().toISOString().split('T')[0]}.csv`

      // Create blob and download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', finalFilename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)

      toast.success('Export réussi', {
        description: `Le fichier ${finalFilename} a été téléchargé.`,
      })
    } catch (error) {
      console.error('Error exporting CSV:', error)
      toast.error("Erreur lors de l'export", {
        description: "Impossible d'exporter les données. Veuillez réessayer.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isExporting || disabled}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
      aria-label="Exporter en CSV"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Export en cours...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Exporter CSV</span>
          <span className="sm:hidden">CSV</span>
        </>
      )}
    </button>
  )
}
