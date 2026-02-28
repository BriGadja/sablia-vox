'use client'

import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { useQueryStates } from 'nuqs'
import { useCallback, useMemo, useState } from 'react'
import { ClientBreakdownTableV2 } from '@/components/dashboard/Financial/ClientBreakdownTableV2'
import { ConsumptionKPIGrid } from '@/components/dashboard/Financial/ConsumptionKPIGrid'
import { FinancialKPIGrid } from '@/components/dashboard/Financial/FinancialKPIGrid'
import FinancialViewToggle from '@/components/dashboard/Financial/FinancialViewToggle'
import { InvoiceSummaryTable } from '@/components/dashboard/Financial/InvoiceSummaryTable'
import { LeasingKPIGrid } from '@/components/dashboard/Financial/LeasingKPIGrid'
import { MonthSelector } from '@/components/dashboard/Financial/MonthSelector'
import { type FinancialViewMode, financialParsers } from '@/lib/hooks/financialSearchParams'
import {
  useClientBreakdown,
  useConsumptionMetrics,
  useCostBreakdown,
  useFinancialKPIs,
  useFinancialTimeSeries,
  useLeasingMetrics,
} from '@/lib/hooks/useFinancialData'
import { useMonthlyInvoice } from '@/lib/hooks/useMonthlyInvoice'
import type { ClientFinancialData, FinancialFilters } from '@/lib/types/financial'
import { getDefaultInvoiceMonth, type SelectedMonth } from '@/lib/types/invoice'

// Lazy load heavy chart components
const FinancialTimeSeriesChart = dynamic(
  () =>
    import('@/components/dashboard/Financial/FinancialTimeSeriesChart').then((mod) => ({
      default: mod.FinancialTimeSeriesChart,
    })),
  {
    loading: () => <ChartSkeleton height={280} />,
    ssr: false,
  },
)

const CostBreakdownChart = dynamic(
  () =>
    import('@/components/dashboard/Financial/CostBreakdownChart').then((mod) => ({
      default: mod.CostBreakdownChart,
    })),
  {
    loading: () => <ChartSkeleton height={280} />,
    ssr: false,
  },
)

const ClientDrilldownModal = dynamic(
  () =>
    import('@/components/dashboard/Financial/ClientDrilldownModal').then((mod) => ({
      default: mod.ClientDrilldownModal,
    })),
  { ssr: false },
)

const ClientUsageDashboard = dynamic(
  () =>
    import('@/components/dashboard/Financial/ClientUsageDashboard').then((mod) => ({
      default: mod.ClientUsageDashboard,
    })),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false,
  },
)

// Skeleton components for loading states
function ChartSkeleton({ height }: { height: number }) {
  return (
    <div
      className="bg-gray-800/50 border border-gray-700/50 rounded-xl animate-pulse"
      style={{ height }}
    >
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-700/50 rounded w-1/3" />
        <div className="h-full bg-gray-700/30 rounded" style={{ height: height - 80 }} />
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-4 space-y-4 animate-pulse">
      <div className="h-8 bg-gray-700/50 rounded w-1/4" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-700/30 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-700/30 rounded-xl" />
    </div>
  )
}

export function FinancialDashboardClient() {
  // Check if viewing as a specific client
  const searchParams = useSearchParams()
  const tenantId = searchParams.get('tenant')
  const isClientView = !!tenantId

  // If in client view, show simplified usage dashboard
  if (isClientView) {
    return <ClientUsageDashboard />
  }

  // Otherwise, show full financial dashboard for admins
  return <AdminFinancialDashboard />
}

function AdminFinancialDashboard() {
  // URL-based state management using nuqs (persisted filters)
  const [searchParams, setSearchParams] = useQueryStates(financialParsers, {
    history: 'push',
    shallow: true,
  })

  // Derive filters from URL params
  const filters: FinancialFilters = useMemo(
    () => ({
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
      clientId: searchParams.clientId || null,
      agentTypeName: searchParams.agentTypeName || null,
      deploymentId: searchParams.deploymentId || null,
    }),
    [searchParams],
  )

  // View mode from URL
  const viewMode = searchParams.viewMode

  // Callbacks for updating URL params
  const setFilters = useCallback(
    (newFilters: Partial<FinancialFilters>) => {
      setSearchParams({
        startDate: newFilters.startDate,
        endDate: newFilters.endDate,
        clientId: newFilters.clientId,
        agentTypeName: newFilters.agentTypeName,
        deploymentId: newFilters.deploymentId,
      })
    },
    [setSearchParams],
  )

  const setViewMode = useCallback(
    (mode: FinancialViewMode) => {
      setSearchParams({ viewMode: mode })
    },
    [setSearchParams],
  )

  // Modal state for drill down (local state is fine for modals)
  const [selectedClient, setSelectedClient] = useState<ClientFinancialData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Invoice month state (defaults to previous month)
  const [invoiceMonth, setInvoiceMonth] = useState<SelectedMonth>(getDefaultInvoiceMonth)

  // Fetch invoice data
  const {
    data: invoiceData,
    isLoading: invoiceLoading,
    error: invoiceError,
  } = useMonthlyInvoice(invoiceMonth.year, invoiceMonth.month)

  // Fetch data
  const { data: kpiData, isLoading: kpiLoading, error: kpiError } = useFinancialKPIs(filters)
  const { data: leasingData, isLoading: leasingLoading } = useLeasingMetrics(filters)
  const { data: consumptionData, isLoading: consumptionLoading } = useConsumptionMetrics(filters)
  const { data: clientData, isLoading: clientLoading } = useClientBreakdown(filters)
  const { data: timeSeriesData, isLoading: timeSeriesLoading } = useFinancialTimeSeries({
    ...filters,
    granularity: 'day',
  })
  const { data: costBreakdownData, isLoading: costBreakdownLoading } = useCostBreakdown(filters)

  return (
    <div className="p-4 space-y-3 h-full overflow-y-auto">
      {/* Compact Header with Filters and Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setSearchParams({ startDate: e.target.value })}
            className="px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <span className="text-gray-500">-</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setSearchParams({ endDate: e.target.value })}
            className="px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          <button
            onClick={() => {
              const now = new Date()
              const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
              setSearchParams({
                startDate: thirtyDaysAgo.toISOString().split('T')[0],
                endDate: now.toISOString().split('T')[0],
              })
            }}
            className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium rounded-lg transition-colors"
          >
            30j
          </button>
        </div>
        <FinancialViewToggle mode={viewMode} onModeChange={setViewMode} />
      </div>

      {/* Error State */}
      {kpiError && (
        <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-400 text-xs">Erreur: {kpiError.message}</p>
        </div>
      )}

      {/* KPI Grid - Conditional based on view mode */}
      {viewMode === 'leasing' ? (
        <LeasingKPIGrid data={leasingData} isLoading={leasingLoading} />
      ) : (
        <ConsumptionKPIGrid data={consumptionData} isLoading={consumptionLoading} />
      )}

      {/* Legacy KPI Grid (hidden, kept for backward compatibility) */}
      <div className="hidden">
        <FinancialKPIGrid data={kpiData} isLoading={kpiLoading} />
      </div>

      {/* Monthly Invoice Summary - Admin Only (placed right after KPIs) */}
      <div className="space-y-3">
        <MonthSelector
          selectedYear={invoiceMonth.year}
          selectedMonth={invoiceMonth.month}
          onChange={(year, month) => setInvoiceMonth({ year, month })}
        />
        <InvoiceSummaryTable data={invoiceData} isLoading={invoiceLoading} error={invoiceError} />
      </div>

      {/* Charts Grid - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <FinancialTimeSeriesChart
          data={timeSeriesData || []}
          isLoading={timeSeriesLoading}
          height={280}
        />
        <CostBreakdownChart
          data={costBreakdownData}
          isLoading={costBreakdownLoading}
          height={280}
        />
      </div>

      {/* Client Breakdown Table */}
      <ClientBreakdownTableV2
        data={clientData}
        isLoading={clientLoading}
        onDetailClick={(client) => {
          setSelectedClient(client)
          setIsModalOpen(true)
        }}
      />

      {/* Client Drill Down Modal */}
      <ClientDrilldownModal
        client={selectedClient}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedClient(null)
        }}
        startDate={filters.startDate}
        endDate={filters.endDate}
      />
    </div>
  )
}
