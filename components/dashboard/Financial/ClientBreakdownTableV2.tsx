'use client'

import { formatCurrency, formatPercentage } from '@/lib/queries/financial'
import type { ClientFinancialData } from '@/lib/types/financial'
import { type ColumnDefinition, InteractiveFinancialTable } from './InteractiveFinancialTable'

// Extended type with computed fields
interface ClientFinancialDataExtended extends ClientFinancialData {
  consumption_revenue: number
  consumption_margin: number
  consumption_margin_pct: number
}

interface ClientBreakdownTableV2Props {
  data: ClientFinancialData[] | undefined
  isLoading?: boolean
  onDetailClick?: (client: ClientFinancialData) => void
}

export function ClientBreakdownTableV2({
  data,
  isLoading,
  onDetailClick,
}: ClientBreakdownTableV2Props) {
  // Filter out Sablia Vox internal and compute additional fields
  const filteredData: ClientFinancialDataExtended[] = (
    data?.filter((client) => client.client_name.toLowerCase() !== 'sablia vox') || []
  ).map((client) => {
    const consumption_revenue = client.call_revenue + client.sms_revenue + client.email_revenue
    const consumption_margin = consumption_revenue - client.total_provider_cost
    const consumption_margin_pct =
      consumption_revenue > 0 ? (consumption_margin / consumption_revenue) * 100 : 0
    return {
      ...client,
      consumption_revenue,
      consumption_margin,
      consumption_margin_pct,
    }
  })

  // Define columns
  const columns: ColumnDefinition<ClientFinancialDataExtended>[] = [
    {
      key: 'client_name',
      label: 'Client',
      sortable: true,
      align: 'left',
      className: 'font-medium text-white',
      width: '180px',
    },
    {
      key: 'total_revenue',
      label: 'Revenu Total',
      sortable: true,
      align: 'right',
      format: (value) => <span className="font-semibold text-white">{formatCurrency(value)}</span>,
    },
    {
      key: 'consumption_revenue',
      label: 'Revenu Conso',
      sortable: true,
      align: 'right',
      format: (value) => (
        <span className="font-semibold text-emerald-400">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'total_provider_cost',
      label: 'Coûts',
      sortable: true,
      align: 'right',
      format: (value) => <span className="text-red-400">{formatCurrency(value)}</span>,
    },
    {
      key: 'consumption_margin',
      label: 'Marge',
      sortable: true,
      align: 'right',
      format: (value) => (
        <span className="font-semibold text-emerald-400">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'consumption_margin_pct',
      label: 'Marge %',
      sortable: true,
      align: 'right',
      format: (value) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
            value >= 50
              ? 'bg-emerald-500/20 text-emerald-400'
              : value >= 30
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-red-500/20 text-red-400'
          }`}
        >
          {formatPercentage(value)}
        </span>
      ),
    },
    {
      key: 'call_count',
      label: 'Appels',
      sortable: true,
      align: 'right',
      format: (value) => <span className="text-gray-300">{value.toLocaleString('fr-FR')}</span>,
    },
    {
      key: 'sms_count',
      label: 'SMS',
      sortable: true,
      align: 'right',
      format: (value) => <span className="text-blue-400">{value.toLocaleString('fr-FR')}</span>,
    },
    {
      key: 'email_count',
      label: 'Emails',
      sortable: true,
      align: 'right',
      format: (value) => <span className="text-cyan-400">{value.toLocaleString('fr-FR')}</span>,
    },
    {
      key: 'appointments_scheduled',
      label: 'RDV',
      sortable: true,
      align: 'right',
      format: (value) => <span className="text-violet-400 font-medium">{value}</span>,
    },
  ]

  // Calculate summary totals (excluding Sablia Vox internal)
  const summary = filteredData.reduce(
    (acc, client) => ({
      totalRevenue: acc.totalRevenue + client.total_revenue,
      totalConsoRevenue: acc.totalConsoRevenue + client.consumption_revenue,
      totalCosts: acc.totalCosts + client.total_provider_cost,
      totalMargin: acc.totalMargin + client.consumption_margin,
      totalCalls: acc.totalCalls + client.call_count,
      totalSMS: acc.totalSMS + client.sms_count,
      totalEmails: acc.totalEmails + client.email_count,
      totalRDV: acc.totalRDV + client.appointments_scheduled,
    }),
    {
      totalRevenue: 0,
      totalConsoRevenue: 0,
      totalCosts: 0,
      totalMargin: 0,
      totalCalls: 0,
      totalSMS: 0,
      totalEmails: 0,
      totalRDV: 0,
    },
  )

  return (
    <div className="space-y-4">
      <InteractiveFinancialTable
        data={filteredData}
        columns={columns}
        isLoading={isLoading}
        title="Breakdown par Client"
        showDetailButton={!!onDetailClick}
        onDetailClick={onDetailClick}
        exportFilename="clients_financials.csv"
        emptyMessage="Aucun client disponible pour cette période"
        pageSize={20}
      />

      {/* Summary Stats */}
      {!isLoading && filteredData.length > 0 && (
        <div className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm p-6">
          <h4 className="text-sm font-semibold text-gray-400 mb-4">Totaux (hors Sablia Vox)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Revenu Total</p>
              <p className="text-white font-bold">{formatCurrency(summary.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Revenu Conso</p>
              <p className="text-emerald-400 font-bold">
                {formatCurrency(summary.totalConsoRevenue)}
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Coûts</p>
              <p className="text-red-400 font-bold">{formatCurrency(summary.totalCosts)}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Marge</p>
              <p className="text-emerald-400 font-bold">{formatCurrency(summary.totalMargin)}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Appels</p>
              <p className="text-white font-bold">{summary.totalCalls.toLocaleString('fr-FR')}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">SMS</p>
              <p className="text-blue-400 font-bold">{summary.totalSMS.toLocaleString('fr-FR')}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Emails</p>
              <p className="text-cyan-400 font-bold">
                {summary.totalEmails.toLocaleString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">RDV</p>
              <p className="text-violet-400 font-bold">{summary.totalRDV}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
