'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, ChevronRight, DollarSign, Phone, TrendingUp, X } from 'lucide-react'
import { useDeploymentChannels } from '@/lib/hooks/useFinancialData'
import { formatCurrency, formatPercentage } from '@/lib/queries/financial'
import type { ClientDeploymentData, DeploymentChannelData } from '@/lib/types/financial'
import { type ColumnDefinition, InteractiveFinancialTable } from './InteractiveFinancialTable'

interface DeploymentDrilldownModalProps {
  deployment: ClientDeploymentData | null
  clientName: string
  isOpen: boolean
  onClose: () => void
  startDate: string
  endDate: string
}

export function DeploymentDrilldownModal({
  deployment,
  clientName,
  isOpen,
  onClose,
  startDate,
  endDate,
}: DeploymentDrilldownModalProps) {
  // Fetch channel data when modal opens
  const { data: channels, isLoading } = useDeploymentChannels(
    deployment?.deployment_id || '',
    startDate,
    endDate,
    isOpen && !!deployment,
  )

  // Define columns for channel table
  const columns: ColumnDefinition<DeploymentChannelData>[] = [
    {
      key: 'channel_label',
      label: 'Canal',
      sortable: true,
      align: 'left',
      format: (value, row) => (
        <div className="flex items-center gap-2">
          <span className="text-xl">{row.channel_icon}</span>
          <span className="font-medium text-white">{value}</span>
        </div>
      ),
      width: '150px',
    },
    {
      key: 'revenue',
      label: 'Revenue',
      sortable: true,
      align: 'right',
      format: (value) => (
        <span className="font-semibold text-amber-400">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'provider_cost',
      label: 'Coût Provider',
      sortable: true,
      align: 'right',
      format: (value) => <span className="text-gray-300">{formatCurrency(value)}</span>,
    },
    {
      key: 'margin',
      label: 'Marge',
      sortable: true,
      align: 'right',
      format: (value) => (
        <span className="font-semibold text-emerald-400">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'margin_percentage',
      label: 'Marge %',
      sortable: true,
      align: 'right',
      format: (value) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
            value >= 95
              ? 'bg-emerald-500/20 text-emerald-400'
              : value >= 90
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-red-500/20 text-red-400'
          }`}
        >
          {formatPercentage(value)}
        </span>
      ),
    },
    {
      key: 'volume',
      label: 'Volume',
      sortable: true,
      align: 'right',
      format: (value) => <span className="text-gray-300">{value.toLocaleString('fr-FR')}</span>,
    },
    {
      key: 'answered_calls',
      label: 'Décrochés',
      sortable: true,
      align: 'right',
      format: (value) =>
        value !== null ? (
          <span className="text-teal-400">{value}</span>
        ) : (
          <span className="text-gray-600">-</span>
        ),
    },
    {
      key: 'appointments',
      label: 'RDV',
      sortable: true,
      align: 'right',
      format: (value) =>
        value !== null ? (
          <span className="text-violet-400 font-medium">{value}</span>
        ) : (
          <span className="text-gray-600">-</span>
        ),
    },
    {
      key: 'revenue_per_item',
      label: 'Rev./Item',
      sortable: true,
      align: 'right',
      format: (value) => <span className="text-xs text-gray-400">{formatCurrency(value)}</span>,
    },
  ]

  // Calculate summary stats
  const summary = channels?.reduce(
    (acc, channel) => ({
      totalRevenue: acc.totalRevenue + channel.revenue,
      totalCost: acc.totalCost + channel.provider_cost,
      totalMargin: acc.totalMargin + channel.margin,
      totalVolume: acc.totalVolume + channel.volume,
    }),
    { totalRevenue: 0, totalCost: 0, totalMargin: 0, totalVolume: 0 },
  ) || { totalRevenue: 0, totalCost: 0, totalMargin: 0, totalVolume: 0 }

  if (!deployment) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-6xl bg-gradient-to-br from-gray-950 via-gray-900 to-black border-l border-gray-800/50 z-50 overflow-y-auto"
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <span>Dashboard Financier</span>
                    <ChevronRight className="w-4 h-4" />
                    <span>{clientName}</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-white font-medium">{deployment.deployment_name}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-1">
                    {deployment.deployment_name}
                  </h2>
                  <p className="text-gray-400">Drill down: Canaux de communication</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-500/20 text-violet-400">
                      {deployment.agent_type_label}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        deployment.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : deployment.status === 'paused'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {deployment.status === 'active'
                        ? 'Actif'
                        : deployment.status === 'paused'
                          ? 'Pause'
                          : 'Archivé'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Deployment KPI Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-amber-400" />
                    <p className="text-sm text-gray-400">Revenue Total</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(deployment.total_revenue)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <p className="text-sm text-gray-400">Marge Voipia</p>
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(deployment.total_margin)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatPercentage(deployment.margin_percentage)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-5 h-5 text-blue-400" />
                    <p className="text-sm text-gray-400">Appels</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {deployment.call_count.toLocaleString('fr-FR')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {deployment.answered_calls} décrochés
                  </p>
                </div>
                <div className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-violet-400" />
                    <p className="text-sm text-gray-400">RDV Pris</p>
                  </div>
                  <p className="text-2xl font-bold text-violet-400">
                    {deployment.appointments_scheduled}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatPercentage(deployment.conversion_rate)} conversion
                  </p>
                </div>
              </div>

              {/* Channels Table */}
              <InteractiveFinancialTable
                data={channels || []}
                columns={columns}
                isLoading={isLoading}
                title={`Canaux (${channels?.length || 0})`}
                exportFilename={`${deployment.deployment_name.toLowerCase().replace(/\s/g, '_')}_channels.csv`}
                emptyMessage="Aucun canal trouvé pour ce déploiement"
                pageSize={10}
              />

              {/* Summary Footer */}
              {!isLoading && channels && channels.length > 0 && (
                <div className="mt-6 rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm p-6">
                  <h4 className="text-sm font-semibold text-gray-400 mb-4">Totaux par canal</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 mb-1">Total Revenue</p>
                      <p className="text-white font-bold">{formatCurrency(summary.totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Total Coût</p>
                      <p className="text-gray-300 font-bold">{formatCurrency(summary.totalCost)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Total Marge</p>
                      <p className="text-emerald-400 font-bold">
                        {formatCurrency(summary.totalMargin)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Total Volume</p>
                      <p className="text-white font-bold">
                        {summary.totalVolume.toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
