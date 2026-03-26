'use client'

import { CallVolumeChart } from '@/components/dashboard/Charts/CallVolumeChart'
import { EmotionDistribution } from '@/components/dashboard/Charts/EmotionDistribution'
import { LatencyTimeSeriesChart } from '@/components/dashboard/Charts/LatencyTimeSeriesChart'
import { OutcomeBreakdown } from '@/components/dashboard/Charts/OutcomeBreakdown'
import { ExportCSVButton } from '@/components/dashboard/ExportCSVButton'
import { AgentFilter } from '@/components/dashboard/Filters/AgentFilter'
import { DateRangeFilter } from '@/components/dashboard/Filters/DateRangeFilter'
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import {
  useCallVolumeByDay,
  useDashboardKPIs,
  useOutcomeDistribution,
} from '@/lib/hooks/useDashboardData'
import { useDashboardFilters } from '@/lib/hooks/useDashboardFilters'
import { useLatencyMetrics } from '@/lib/hooks/useLatencyData'
import { exportCallsToCSV } from '@/lib/queries/global'

interface OverviewDashboardClientProps {
  userEmail?: string
}

/**
 * Overview Dashboard Client Component
 * Aggregated dashboard showing metrics across ALL agents accessible by the user
 * 5 KPIs compact + 4 charts in 2x2 grid
 */
export function OverviewDashboardClient({ userEmail }: OverviewDashboardClientProps) {
  // URL-based filters
  const { filters, setDeploymentId, setTemplateType, setDateRange } = useDashboardFilters()

  // Fetch global metrics
  const { data: kpiData, isLoading: isLoadingKPIs } = useDashboardKPIs(filters)
  const { data: callVolumeData, isLoading: isLoadingCallVolume } = useCallVolumeByDay(filters)
  const { data: outcomeData, isLoading: isLoadingOutcomes } = useOutcomeDistribution(filters)

  // Fetch latency metrics (no agent type filter for overview)
  const { data: latencyData, isLoading: isLoadingLatencies } = useLatencyMetrics({
    startDate: filters.startDate,
    endDate: filters.endDate,
    deploymentId: filters.deploymentId,
    templateType: filters.templateType,
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

  const handleFilterChange = (templateType: string | null, agentIds: string[]) => {
    setTemplateType(templateType)
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
            <AgentFilter
              selectedAgentIds={filters.deploymentId ? [filters.deploymentId] : []}
              onChange={(agentIds) => handleFilterChange(filters.templateType || null, agentIds)}
            />
          </div>
          <ExportCSVButton
            filters={filters}
            exportFn={exportCallsToCSV}
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
            <CallVolumeChart data={callVolumeData || []} />
          </div>
          <div className="h-full min-h-[180px] overflow-hidden">
            <EmotionDistribution data={[]} />
          </div>
          <div className="h-full min-h-[180px] overflow-hidden">
            <LatencyTimeSeriesChart data={latencyData || []} isLoading={isLoadingLatencies} />
          </div>
          <div className="h-full min-h-[180px] overflow-hidden">
            <OutcomeBreakdown data={outcomeData || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
