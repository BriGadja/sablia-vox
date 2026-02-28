'use client'

import { motion } from 'framer-motion'
import { formatCurrency, formatPercentage } from '@/lib/queries/financial'
import type { ClientFinancialData } from '@/lib/types/financial'

interface ClientBreakdownTableProps {
  data: ClientFinancialData[] | undefined
  isLoading?: boolean
}

export function ClientBreakdownTable({ data, isLoading }: ClientBreakdownTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm overflow-hidden">
        <div className="p-6">
          <div className="h-8 w-48 bg-gray-800/50 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-800/30 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm p-8 text-center">
        <p className="text-gray-400">Aucune donnée disponible pour cette période</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-gray-800/50 bg-black/20 backdrop-blur-sm overflow-hidden"
    >
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">Breakdown par Client</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800/50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Client</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
                  Revenue
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Coûts</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Marge</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">
                  Marge %
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Appels</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">SMS</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Emails</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">RDV</th>
              </tr>
            </thead>
            <tbody>
              {data.map((client, index) => (
                <motion.tr
                  key={client.client_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-gray-800/30 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 px-4 text-sm font-medium text-white">{client.client_name}</td>
                  <td className="py-3 px-4 text-sm text-right font-semibold text-amber-400">
                    {formatCurrency(client.total_revenue)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-red-400">
                    {formatCurrency(client.total_provider_cost)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right font-semibold text-emerald-400">
                    {formatCurrency(client.total_margin)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                        client.margin_percentage >= 95
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : client.margin_percentage >= 90
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {formatPercentage(client.margin_percentage)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-gray-300">
                    {client.call_count.toLocaleString('fr-FR')}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-blue-400">
                    {client.sms_count.toLocaleString('fr-FR')}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-cyan-400">
                    {client.email_count.toLocaleString('fr-FR')}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-violet-400 font-medium">
                    {client.appointments_scheduled}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary row */}
        <div className="mt-4 pt-4 border-t border-gray-800/50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Total Revenue</p>
              <p className="text-white font-bold">
                {formatCurrency(
                  data
                    .filter((c) => c.client_name.toLowerCase() !== 'voipia')
                    .reduce((sum, c) => sum + c.total_revenue, 0),
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Total Marge</p>
              <p className="text-emerald-400 font-bold">
                {formatCurrency(
                  data
                    .filter((c) => c.client_name.toLowerCase() !== 'voipia')
                    .reduce((sum, c) => sum + c.total_margin, 0),
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Total Appels</p>
              <p className="text-white font-bold">
                {data
                  .filter((c) => c.client_name.toLowerCase() !== 'voipia')
                  .reduce((sum, c) => sum + c.call_count, 0)
                  .toLocaleString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Total SMS</p>
              <p className="text-blue-400 font-bold">
                {data
                  .filter((c) => c.client_name.toLowerCase() !== 'voipia')
                  .reduce((sum, c) => sum + c.sms_count, 0)
                  .toLocaleString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Total Emails</p>
              <p className="text-cyan-400 font-bold">
                {data
                  .filter((c) => c.client_name.toLowerCase() !== 'voipia')
                  .reduce((sum, c) => sum + c.email_count, 0)
                  .toLocaleString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Total RDV</p>
              <p className="text-violet-400 font-bold">
                {data
                  .filter((c) => c.client_name.toLowerCase() !== 'voipia')
                  .reduce((sum, c) => sum + c.appointments_scheduled, 0)}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3 italic">
            * Les totaux excluent Voipia (agent interne)
          </p>
        </div>
      </div>
    </motion.div>
  )
}
