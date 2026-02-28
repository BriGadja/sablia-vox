'use client'

import { format, startOfMonth } from 'date-fns'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { AgentConsumptionChart } from '@/components/dashboard/Charts/AgentConsumptionChart'
import { ChannelDistributionChart } from '@/components/dashboard/Charts/ChannelDistributionChart'
import { ConsumptionEvolutionChart } from '@/components/dashboard/Charts/ConsumptionEvolutionChart'
import { MonthlyComparisonChart } from '@/components/dashboard/Charts/MonthlyComparisonChart'
import { ConsumptionKPIGrid } from '@/components/dashboard/Consumption/ConsumptionKPIGrid'
import { DateRangeFilter } from '@/components/dashboard/Filters/DateRangeFilter'
import { useConsumptionChartData } from '@/lib/hooks/useConsumptionCharts'
import { useUserConsumption } from '@/lib/hooks/useUserConsumption'
import type { ConsumptionFilters } from '@/lib/types/consumption'

/**
 * Dashboard Ma Conso - Suivi de consommation pour les clients
 *
 * Layout identique aux dashboards agents:
 * - Filtres en haut (date range)
 * - 6 KPIs compacts
 * - 4 graphiques en grille 2x2
 *
 * SECURITE: N'affiche JAMAIS de donnees de marge (provider_cost, margin, etc.)
 */
export function UserConsumptionDashboardClient() {
  const searchParams = useSearchParams()

  // Get viewAsUser from URL params (for admin "view as user" feature)
  const viewAsUserId = searchParams.get('viewAsUser')

  // State pour les dates
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()))
  const [endDate, setEndDate] = useState<Date>(new Date())

  // Convertir dates en strings pour les queries
  const filters: ConsumptionFilters = useMemo(
    () => ({
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      clientId: null,
    }),
    [startDate, endDate],
  )

  // Fetch data - pass viewAsUserId for admin "view as user" feature
  const {
    data: kpiData,
    isLoading: isLoadingKPIs,
    error: kpiError,
  } = useUserConsumption(filters, viewAsUserId)
  const {
    data: chartData,
    isLoading: isLoadingCharts,
    error: chartError,
  } = useConsumptionChartData(filters, viewAsUserId)

  // Handle date change
  const handleDateChange = (start: Date, end: Date) => {
    setStartDate(start)
    setEndDate(end)
  }

  // Error state
  if (kpiError || chartError) {
    return (
      <div className="h-full p-1.5 overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-400 mb-2">Erreur de chargement</p>
            <p className="text-white/60 text-sm">{kpiError?.message || chartError?.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full p-1.5 overflow-hidden">
      <div className="flex flex-col gap-1.5 h-full">
        {/* Filters Row */}
        <div className="flex flex-col lg:flex-row gap-1.5 items-start lg:items-center justify-between flex-shrink-0">
          <div className="flex flex-col lg:flex-row gap-1.5 items-start lg:items-center">
            <DateRangeFilter startDate={startDate} endDate={endDate} onChange={handleDateChange} />
          </div>
          <div className="text-sm text-white/50">Ma Consommation</div>
        </div>

        {/* KPIs Grid - 6 compact cards */}
        <div className="flex-shrink-0">
          <ConsumptionKPIGrid data={kpiData} isLoading={isLoadingKPIs} />
        </div>

        {/* Charts Grid - 2x2 balanced layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1.5 flex-1 min-h-0 overflow-hidden">
          <div className="h-full min-h-[180px] overflow-hidden">
            <ConsumptionEvolutionChart data={chartData?.daily_consumption} />
          </div>
          <div className="h-full min-h-[180px] overflow-hidden">
            <ChannelDistributionChart data={chartData?.by_channel} />
          </div>
          <div className="h-full min-h-[180px] overflow-hidden">
            <AgentConsumptionChart data={chartData?.by_agent} />
          </div>
          <div className="h-full min-h-[180px] overflow-hidden">
            <MonthlyComparisonChart data={chartData?.monthly_history} />
          </div>
        </div>
      </div>
    </div>
  )
}
