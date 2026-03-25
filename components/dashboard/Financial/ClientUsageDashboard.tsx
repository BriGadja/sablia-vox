'use client'

import { Clock, Mail, MessageSquare, Phone, TrendingUp } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getDefaultDateRange } from '@/lib/queries/financial'
import { createClient } from '@/lib/supabase/client'

interface UsageMetrics {
  total_calls: number
  total_minutes: number
  total_sms: number
  total_emails: number
  avg_call_duration: number
}

interface DailyUsage {
  date: string
  calls: number
  minutes: number
  sms: number
  emails: number
}

/**
 * Client Usage Dashboard - Simplified view for clients
 * Shows only usage metrics (minutes, SMS, emails) without costs
 */
export function ClientUsageDashboard() {
  const searchParams = useSearchParams()
  const tenantId = searchParams.get('tenant')

  const defaultRange = getDefaultDateRange()
  const [startDate, setStartDate] = useState(defaultRange.startDate)
  const [endDate, setEndDate] = useState(defaultRange.endDate)
  const [metrics, setMetrics] = useState<UsageMetrics | null>(null)
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsageMetrics() {
      if (!tenantId) return

      setIsLoading(true)
      setError(null)

      const supabase = createClient()

      try {
        // Fetch calls metrics
        const { data: callsData, error: callsError } = await supabase
          .from('agent_calls')
          .select(`
            id,
            duration_seconds,
            started_at,
            agent_deployments!inner(client_id)
          `)
          .eq('agent_deployments.client_id', tenantId)
          .gte('started_at', startDate)
          .lte('started_at', endDate)

        if (callsError) throw callsError

        // Fetch SMS metrics
        const { data: smsData, error: smsError } = await supabase
          .from('agent_sms')
          .select(`
            id,
            sent_at,
            agent_deployments!inner(client_id)
          `)
          .eq('agent_deployments.client_id', tenantId)
          .gte('sent_at', startDate)
          .lte('sent_at', endDate)

        if (smsError) throw smsError

        // Fetch emails metrics
        const { data: emailsData, error: emailsError } = await supabase
          .from('agent_emails')
          .select(`
            id,
            sent_at,
            agent_deployments!inner(client_id)
          `)
          .eq('agent_deployments.client_id', tenantId)
          .gte('sent_at', startDate)
          .lte('sent_at', endDate)

        if (emailsError) throw emailsError

        // Calculate metrics
        const totalCalls = callsData?.length || 0
        const totalSeconds =
          callsData?.reduce((sum, call) => sum + (call.duration_seconds || 0), 0) || 0
        const totalMinutes = Math.round(totalSeconds / 60)
        const avgDuration = totalCalls > 0 ? Math.round(totalSeconds / totalCalls) : 0
        const totalSms = smsData?.length || 0
        const totalEmails = emailsData?.length || 0

        setMetrics({
          total_calls: totalCalls,
          total_minutes: totalMinutes,
          total_sms: totalSms,
          total_emails: totalEmails,
          avg_call_duration: avgDuration,
        })

        // Calculate daily usage for chart
        const dailyMap = new Map<string, DailyUsage>()

        callsData?.forEach((call) => {
          const date = call.started_at?.split('T')[0]
          if (date) {
            const existing = dailyMap.get(date) || { date, calls: 0, minutes: 0, sms: 0, emails: 0 }
            existing.calls += 1
            existing.minutes += Math.round((call.duration_seconds || 0) / 60)
            dailyMap.set(date, existing)
          }
        })

        smsData?.forEach((sms) => {
          const date = sms.sent_at?.split('T')[0]
          if (date) {
            const existing = dailyMap.get(date) || { date, calls: 0, minutes: 0, sms: 0, emails: 0 }
            existing.sms += 1
            dailyMap.set(date, existing)
          }
        })

        emailsData?.forEach((email) => {
          const date = email.sent_at?.split('T')[0]
          if (date) {
            const existing = dailyMap.get(date) || { date, calls: 0, minutes: 0, sms: 0, emails: 0 }
            existing.emails += 1
            dailyMap.set(date, existing)
          }
        })

        const sortedDaily = Array.from(dailyMap.values()).sort((a, b) =>
          a.date.localeCompare(b.date),
        )
        setDailyUsage(sortedDaily)
      } catch (err) {
        console.error('Error fetching usage metrics:', err)
        setError('Erreur lors du chargement des donnees')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsageMetrics()
  }, [tenantId, startDate, endDate])

  if (!tenantId) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-400">Selectionnez un client pour voir les donnees d&apos;usage</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Consommation</h1>
          <p className="text-gray-400 text-sm">
            Suivi de votre utilisation des services Sablia Vox
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-400">Du:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-400">Au:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => {
              const range = getDefaultDateRange()
              setStartDate(range.startDate)
              setEndDate(range.endDate)
            }}
            className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            30 derniers jours
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Calls */}
          <div className="bg-linear-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-blue-300 font-medium">Appels</span>
            </div>
            {isLoading ? (
              <div className="h-8 bg-white/10 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-white">
                {metrics?.total_calls.toLocaleString() || 0}
              </p>
            )}
          </div>

          {/* Total Minutes */}
          <div className="bg-linear-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-300 font-medium">Minutes</span>
            </div>
            {isLoading ? (
              <div className="h-8 bg-white/10 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-white">
                {metrics?.total_minutes.toLocaleString() || 0}
                <span className="text-sm font-normal text-gray-400 ml-1">min</span>
              </p>
            )}
          </div>

          {/* Total SMS */}
          <div className="bg-linear-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-300 font-medium">SMS</span>
            </div>
            {isLoading ? (
              <div className="h-8 bg-white/10 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-white">
                {metrics?.total_sms.toLocaleString() || 0}
              </p>
            )}
          </div>

          {/* Total Emails */}
          <div className="bg-linear-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-violet-300 font-medium">Emails</span>
            </div>
            {isLoading ? (
              <div className="h-8 bg-white/10 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-white">
                {metrics?.total_emails.toLocaleString() || 0}
              </p>
            )}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">Statistiques supplementaires</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Duree moyenne par appel</p>
              {isLoading ? (
                <div className="h-5 bg-white/10 rounded animate-pulse w-16" />
              ) : (
                <p className="text-lg font-semibold text-white">
                  {Math.floor((metrics?.avg_call_duration || 0) / 60)}m{' '}
                  {(metrics?.avg_call_duration || 0) % 60}s
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Periode</p>
              <p className="text-sm text-white">
                {new Date(startDate).toLocaleDateString('fr-FR')} -{' '}
                {new Date(endDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Jours avec activite</p>
              {isLoading ? (
                <div className="h-5 bg-white/10 rounded animate-pulse w-8" />
              ) : (
                <p className="text-lg font-semibold text-white">{dailyUsage.length}</p>
              )}
            </div>
          </div>
        </div>

        {/* Daily Usage Table */}
        {!isLoading && dailyUsage.length > 0 && (
          <div className="bg-gray-800/30 border border-gray-700/30 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-gray-700/30">
              <h3 className="text-sm font-medium text-gray-300">Detail par jour</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400">Date</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">
                      Appels
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">
                      Minutes
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">SMS</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-400">
                      Emails
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {dailyUsage
                    .slice(-14)
                    .reverse()
                    .map((day) => (
                      <tr key={day.date} className="hover:bg-gray-800/30">
                        <td className="px-4 py-2 text-sm text-white">
                          {new Date(day.date).toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-gray-300">{day.calls}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-300">
                          {day.minutes}
                        </td>
                        <td className="px-4 py-2 text-sm text-right text-gray-300">{day.sms}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-300">{day.emails}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && dailyUsage.length === 0 && (
          <div className="text-center py-12">
            <Phone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aucune activite sur cette periode</p>
          </div>
        )}
      </div>
    </div>
  )
}
