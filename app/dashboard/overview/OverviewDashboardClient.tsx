'use client'

import { AgentTypeComparisonChart } from '@/components/dashboard/Charts/AgentTypeComparisonChart'
import { CallVolumeChart } from '@/components/dashboard/Charts/CallVolumeChart'
import { EmotionDistribution } from '@/components/dashboard/Charts/EmotionDistribution'
import { LatencyTimeSeriesChart } from '@/components/dashboard/Charts/LatencyTimeSeriesChart'
import { ExportCSVButton } from '@/components/dashboard/ExportCSVButton'
import { ClientAgentFilter } from '@/components/dashboard/Filters/ClientAgentFilter'
import { DateRangeFilter } from '@/components/dashboard/Filters/DateRangeFilter'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import {
  useAgentTypePerformance,
  useGlobalChartData,
  useGlobalKPIs,
} from '@/lib/hooks/useDashboardData'
import { useDashboardFilters } from '@/lib/hooks/useDashboardFilters'
import { useLatencyMetrics } from '@/lib/hooks/useLatencyData'
import { exportGlobalCallsToCSV } from '@/lib/queries/global'

interface OverviewDashboardClientProps {
  userEmail?: string
}

/**
 * Overview Dashboard Client Component
 * Aggregated dashboard showing metrics across ALL agents accessible by the user
 * Uses the standard Louis dashboard layout (6 KPIs compact, 4 charts 2x2)
 *
 * KPIs (order: funnel chronologique):
 * 1. Total Appels
 * 2. Taux Décroché
 * 3. Durée Moyenne
 * 4. Sentiment Positif
 * 5. Latence Moyenne
 * 6. Coût Total
 *
 * Charts (2x2 grid):
 * - Top-left: Volume par jour (Area chart, breakdown par agent type)
 * - Top-right: Distribution émotions (Donut chart)
 * - Bottom-left: Performance par type (Bar chart, comparatif Louis vs Arthur vs Alexandra)
 * - Bottom-right: Latence infrastructure (Line chart)
 */
export function OverviewDashboardClient({ userEmail }: OverviewDashboardClientProps) {
  // URL-based filters
  const { filters, setClientIds, setDeploymentId, setDateRange } = useDashboardFilters()

  // Fetch global metrics
  const { data: kpiData, isLoading: isLoadingKPIs } = useGlobalKPIs(filters)
  const { data: chartData, isLoading: isLoadingCharts } = useGlobalChartData(filters)
  const { data: agentTypeData, isLoading: isLoadingAgentTypes } = useAgentTypePerformance(filters)

  // Fetch latency metrics (no agent type filter for overview)
  const { data: latencyData, isLoading: isLoadingLatencies } = useLatencyMetrics({
    startDate: filters.startDate,
    endDate: filters.endDate,
    deploymentId: filters.deploymentId,
    clientId: filters.clientIds.length === 1 ? filters.clientIds[0] : null,
    agentTypeName: null, // All agent types for overview
  })

  // Calculate average total latency for KPI
  const avgTotalLatency =
    latencyData && latencyData.length > 0
      ? Math.round(
          latencyData.reduce((sum, m) => sum + m.avg_total_latency_ms * m.call_count, 0) /
            latencyData.reduce((sum, m) => sum + m.call_count, 0),
        )
      : 0

  // Handle filter changes
  const handleDateChange = (start: Date, end: Date) => {
    setDateRange(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
  }

  const handleFilterChange = (clientIds: string[], agentIds: string[]) => {
    setClientIds(clientIds)
    setDeploymentId(agentIds.length === 1 ? agentIds[0] : null)
  }

  return (
    <div className="h-full p-1.5 overflow-hidden">
      <div className="flex flex-col gap-1.5 h-full">
        {/* Filters Row with Export */}
        <div className="flex flex-col lg:flex-row gap-1.5 items-start lg:items-center justify-between flex-shrink-0">
          <div className="flex flex-col lg:flex-row gap-1.5 items-start lg:items-center">
            <DateRangeFilter
              startDate={new Date(filters.startDate)}
              endDate={new Date(filters.endDate)}
              onChange={handleDateChange}
            />
            <ClientAgentFilter
              selectedClientIds={filters.clientIds}
              selectedAgentIds={filters.deploymentId ? [filters.deploymentId] : []}
              onChange={handleFilterChange}
            />
          </div>
          <ExportCSVButton
            filters={filters}
            exportFn={exportGlobalCallsToCSV}
            filename="overview-dashboard-export.csv"
          />
        </div>

        {/* KPIs Grid - 6 compact cards */}
        <div className="flex-shrink-0">
          <KPIGrid
            data={kpiData}
            isLoading={isLoadingKPIs}
            agentType="overview"
            avgLatency={avgTotalLatency}
          />
        </div>

        {/* Charts Grid - 2x2 balanced layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5 flex-1 min-h-0 overflow-hidden">
          <div className="h-full min-h-[180px] overflow-hidden">
            <CallVolumeChart data={chartData?.call_volume_by_day || []} />
          </div>
          <div className="h-full min-h-[180px] overflow-hidden">
            <EmotionDistribution data={chartData?.emotion_distribution || []} />
          </div>
          <div className="h-full min-h-[180px] overflow-hidden">
            <LatencyTimeSeriesChart data={latencyData || []} isLoading={isLoadingLatencies} />
          </div>
          <div className="h-full min-h-[180px] overflow-hidden">
            <AgentTypeComparisonChart data={agentTypeData || []} isLoading={isLoadingAgentTypes} />
          </div>
        </div>
      </div>
    </div>
  )
}
