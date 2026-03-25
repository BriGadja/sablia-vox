'use client'

import { ChevronRight, DollarSign, Mail, MessageSquare, Phone, TrendingUp, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { useClientDeployments } from '@/lib/hooks/useFinancialData'
import { formatCurrency, formatPercentage } from '@/lib/queries/financial'
import type { ClientDeploymentData, ClientFinancialData } from '@/lib/types/financial'
import { DeploymentDrilldownModal } from './DeploymentDrilldownModal'
import { type ColumnDefinition, InteractiveFinancialTable } from './InteractiveFinancialTable'

interface ClientDrilldownModalProps {
  client: ClientFinancialData | null
  isOpen: boolean
  onClose: () => void
  startDate: string
  endDate: string
}

export function ClientDrilldownModal({
  client,
  isOpen,
  onClose,
  startDate,
  endDate,
}: ClientDrilldownModalProps) {
  // State for deployment drill down (level 2)
  const [selectedDeployment, setSelectedDeployment] = useState<ClientDeploymentData | null>(null)
  const [isDeploymentModalOpen, setIsDeploymentModalOpen] = useState(false)

  // Fetch deployment data when modal opens
  const { data: deployments, isLoading } = useClientDeployments(
    client?.client_id || '',
    startDate,
    endDate,
    isOpen && !!client,
  )

  // Handle row click to open deployment drill down
  const handleDeploymentClick = (deployment: ClientDeploymentData) => {
    setSelectedDeployment(deployment)
    setIsDeploymentModalOpen(true)
  }

  // Define columns for deployment table
  const columns: ColumnDefinition<ClientDeploymentData>[] = [
    {
      key: 'deployment_name',
      label: 'Déploiement',
      sortable: true,
      align: 'left',
      className: 'font-medium text-white',
      width: '200px',
    },
    {
      key: 'agent_type_label',
      label: 'Agent',
      sortable: true,
      align: 'left',
      format: (value) => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-500/20 text-violet-400">
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      align: 'center',
      format: (value) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
            value === 'active'
              ? 'bg-emerald-500/20 text-emerald-400'
              : value === 'paused'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-gray-500/20 text-gray-400'
          }`}
        >
          {value === 'active' ? 'Actif' : value === 'paused' ? 'Pause' : 'Archivé'}
        </span>
      ),
    },
    {
      key: 'total_revenue',
      label: 'Revenue',
      sortable: true,
      align: 'right',
      format: (value) => (
        <span className="font-semibold text-amber-400">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'total_margin',
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
      key: 'call_count',
      label: 'Appels',
      sortable: true,
      align: 'right',
      format: (value) => <span className="text-gray-300">{value.toLocaleString('fr-FR')}</span>,
    },
    {
      key: 'appointments_scheduled',
      label: 'RDV',
      sortable: true,
      align: 'right',
      format: (value) => <span className="text-violet-400 font-medium">{value}</span>,
    },
  ]

  // Calculate summary stats
  const summary = deployments?.reduce(
    (acc, dep) => ({
      totalRevenue: acc.totalRevenue + dep.total_revenue,
      totalMargin: acc.totalMargin + dep.total_margin,
      totalCalls: acc.totalCalls + dep.call_count,
      totalRDV: acc.totalRDV + dep.appointments_scheduled,
    }),
    { totalRevenue: 0, totalMargin: 0, totalCalls: 0, totalRDV: 0 },
  ) || { totalRevenue: 0, totalMargin: 0, totalCalls: 0, totalRDV: 0 }

  if (!client) return null

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
            className="fixed right-0 top-0 bottom-0 w-full max-w-6xl bg-linear-to-br from-gray-950 via-gray-900 to-black border-l border-gray-800/50 z-50 overflow-y-auto"
          >
            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <span>Dashboard Financier</span>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-white font-medium">{client.client_name}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-1">{client.client_name}</h2>
                  <p className="text-gray-400">Drill down: Déploiements par agent</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              {/* Client KPI Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-amber-400" />
                    <p className="text-sm text-gray-400">Revenue Total</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(client.total_revenue)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <p className="text-sm text-gray-400">Marge Sablia Vox</p>
                  </div>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(client.total_margin)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatPercentage(client.margin_percentage)}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="w-5 h-5 text-blue-400" />
                    <p className="text-sm text-gray-400">Appels</p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {client.call_count.toLocaleString('fr-FR')}
                  </p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-gray-500">
                      <MessageSquare className="w-3 h-3 inline mr-1" />
                      {client.sms_count}
                    </span>
                    <span className="text-xs text-gray-500">
                      <Mail className="w-3 h-3 inline mr-1" />
                      {client.email_count}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📅</span>
                    <p className="text-sm text-gray-400">RDV Pris</p>
                  </div>
                  <p className="text-2xl font-bold text-violet-400">
                    {client.appointments_scheduled}
                  </p>
                </div>
              </div>

              {/* Deployments Table */}
              <InteractiveFinancialTable
                data={deployments || []}
                columns={columns}
                isLoading={isLoading}
                title={`Déploiements (${deployments?.length || 0})`}
                exportFilename={`${client.client_name.toLowerCase().replace(/\s/g, '_')}_deployments.csv`}
                emptyMessage="Aucun déploiement trouvé pour ce client"
                pageSize={20}
                onRowClick={handleDeploymentClick}
              />

              {/* Summary Footer */}
              {!isLoading && deployments && deployments.length > 0 && (
                <div className="mt-6 rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm p-6">
                  <h4 className="text-sm font-semibold text-gray-400 mb-4">
                    Totaux des déploiements
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400 mb-1">Total Revenue</p>
                      <p className="text-white font-bold">{formatCurrency(summary.totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Total Marge</p>
                      <p className="text-emerald-400 font-bold">
                        {formatCurrency(summary.totalMargin)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Total Appels</p>
                      <p className="text-white font-bold">
                        {summary.totalCalls.toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Total RDV</p>
                      <p className="text-violet-400 font-bold">{summary.totalRDV}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Deployment Drill Down Modal (Level 2) */}
          <DeploymentDrilldownModal
            deployment={selectedDeployment}
            clientName={client.client_name}
            isOpen={isDeploymentModalOpen}
            onClose={() => {
              setIsDeploymentModalOpen(false)
              setSelectedDeployment(null)
            }}
            startDate={startDate}
            endDate={endDate}
          />
        </>
      )}
    </AnimatePresence>
  )
}
