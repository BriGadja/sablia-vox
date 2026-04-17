'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { BarChart3, Calendar, MessageSquare, Phone, TrendingUp } from 'lucide-react'
import { parseAsBoolean, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/motion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { useConsumptionData } from '@/lib/hooks/useConsumptionData'
import { BILLING, type DeploymentConsumption, type MonthPreset } from '@/lib/types/consumption'
import { cn } from '@/lib/utils'
import { type BillingGroup, groupByBillingClient } from '@/lib/utils/group-by-billing-client'

const TEMPLATE_COLORS: Record<string, string> = {
  setter: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  secretary: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  transfer: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
}

function getCurrentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(now, 'yyyy-MM-dd'),
  }
}

function getPreviousMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const end = new Date(now.getFullYear(), now.getMonth(), 0)
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
  }
}

function AgentConsumptionCard({ agent }: { agent: DeploymentConsumption }) {
  const minutesUsed = agent.total_minutes
  const included = BILLING.INCLUDED_MINUTES
  const progress = Math.min((minutesUsed / included) * 100, 100)
  const overage = Math.max(minutesUsed - included, 0)
  const overageCost = overage * BILLING.OVERAGE_RATE
  const smsCost = agent.sms_count * (agent.cost_per_sms ?? BILLING.SMS_RATE)
  const templateColor =
    TEMPLATE_COLORS[agent.template_type] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-white">{agent.agent_name}</h3>
          <span
            className={cn(
              'px-2 py-0.5 rounded-md text-xs font-medium border capitalize',
              templateColor,
            )}
          >
            {agent.template_type}
          </span>
        </div>
        <span className="text-xs text-white/40">{agent.call_count} appels</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Minutes utilisées</span>
          <span className="text-white font-medium tabular-nums">
            {minutesUsed.toFixed(1)} / {included}
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            style={{ width: `${progress}%` }}
            className={cn(
              'h-full rounded-full transition-all',
              progress >= 100 ? 'bg-orange-500' : 'bg-purple-500',
            )}
          />
        </div>
        {overage > 0 && (
          <p className="text-xs text-orange-400">
            +{overage.toFixed(1)} min hors forfait ({overageCost.toFixed(2)} €)
          </p>
        )}
      </div>

      {agent.sms_count > 0 && (
        <div className="flex items-center justify-between text-sm pt-2 border-t border-white/5">
          <span className="text-white/60 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            SMS envoyés
          </span>
          <span className="text-white tabular-nums">
            {agent.sms_count} ({smsCost.toFixed(2)} €)
          </span>
        </div>
      )}
    </div>
  )
}

function BillingGroupSection({ group }: { group: BillingGroup }) {
  const baseCost = group.deployments.length * BILLING.MONTHLY_BASE_PER_AGENT
  const overage = group.deployments.reduce((sum, d) => {
    const over = Math.max(d.total_minutes - BILLING.INCLUDED_MINUTES, 0)
    return sum + over * BILLING.OVERAGE_RATE
  }, 0)
  const smsCost = group.deployments.reduce(
    (sum, d) => sum + d.sms_count * (d.cost_per_sms ?? BILLING.SMS_RATE),
    0,
  )
  const groupTotal = baseCost + overage + smsCost

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-white">{group.groupName}</h2>
          {group.isInternal && (
            <span className="text-[10px] uppercase tracking-wide text-white/40 border border-white/10 rounded px-1.5 py-0.5">
              Interne
            </span>
          )}
          <span className="text-xs text-white/40">
            {group.deployments.length} agent{group.deployments.length > 1 ? 's' : ''}
          </span>
        </div>
        <span className="text-sm font-semibold text-white tabular-nums">
          {groupTotal.toFixed(2)} €
        </span>
      </div>

      <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {group.deployments.map((agent) => (
          <StaggerItem key={agent.deployment_id}>
            <AgentConsumptionCard agent={agent} />
          </StaggerItem>
        ))}
      </StaggerChildren>
    </section>
  )
}

export function ConsumptionClient({ isAdmin }: { isAdmin: boolean }) {
  const defaults = getCurrentMonthRange()
  const [filters, setFilters] = useQueryStates({
    startDate: parseAsString.withDefault(defaults.startDate),
    endDate: parseAsString.withDefault(defaults.endDate),
    month: parseAsStringEnum<MonthPreset>(['current', 'previous', 'custom']).withDefault('current'),
    clientsOnly: parseAsBoolean.withDefault(isAdmin),
  })

  function applyMonthPreset(month: MonthPreset) {
    if (month === 'current') {
      const r = getCurrentMonthRange()
      setFilters({ month, startDate: r.startDate, endDate: r.endDate })
    } else if (month === 'previous') {
      const r = getPreviousMonthRange()
      setFilters({ month, startDate: r.startDate, endDate: r.endDate })
    } else {
      setFilters({ month })
    }
  }

  const { data, isLoading, error } = useConsumptionData({
    startDate: filters.startDate,
    endDate: filters.endDate,
    clientsOnly: filters.clientsOnly,
  })

  const deployments = data?.by_deployment ?? []
  const groups = groupByBillingClient(deployments)

  const totalBase = deployments.length * BILLING.MONTHLY_BASE_PER_AGENT
  const totalOverage = deployments.reduce((sum, d) => {
    const over = Math.max(d.total_minutes - BILLING.INCLUDED_MINUTES, 0)
    return sum + over * BILLING.OVERAGE_RATE
  }, 0)
  const totalSms = deployments.reduce(
    (sum, d) => sum + d.sms_count * (d.cost_per_sms ?? BILLING.SMS_RATE),
    0,
  )
  const totalCost = totalBase + totalOverage + totalSms

  const periodLabel = (() => {
    try {
      const start = new Date(`${filters.startDate}T00:00:00`)
      return format(start, 'MMMM yyyy', { locale: fr })
    } catch {
      return `${filters.startDate} — ${filters.endDate}`
    }
  })()

  return (
    <div className="p-6 space-y-6 page-fade-in">
      <PageHeader
        title="Consommation"
        description={`Suivi de l'utilisation de vos agents — ${periodLabel}`}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={filters.month} onValueChange={(v) => applyMonthPreset(v as MonthPreset)}>
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Mois en cours</SelectItem>
            <SelectItem value="previous">Mois précédent</SelectItem>
            <SelectItem value="custom">Personnalisé</SelectItem>
          </SelectContent>
        </Select>

        <Calendar className="w-4 h-4 text-white/40" />
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ startDate: e.target.value, month: 'custom' })}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white [color-scheme:dark]"
        />
        <span className="text-white/40">—</span>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ endDate: e.target.value, month: 'custom' })}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white [color-scheme:dark]"
        />

        {isAdmin && (
          <label
            htmlFor="clients-only-toggle"
            className="ml-auto flex items-center gap-2 text-sm text-white/70"
          >
            <Switch
              id="clients-only-toggle"
              checked={filters.clientsOnly}
              onCheckedChange={(checked) => setFilters({ clientsOnly: checked })}
            />
            Agents clients uniquement
          </label>
        )}
      </div>

      {isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['s1', 's2', 's3', 's4'].map((key) => (
              <Skeleton key={key} className="h-40 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-32 rounded-xl" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-red-400">Erreur de chargement des données de consommation</p>
        </div>
      )}

      {data && (
        <>
          {groups.length === 0 ? (
            <FadeIn>
              <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
                <BarChart3 className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/60">Aucun agent actif pour cette période</p>
              </div>
            </FadeIn>
          ) : (
            <div className="space-y-8">
              {groups.map((group) => (
                <BillingGroupSection key={group.groupName} group={group} />
              ))}
            </div>
          )}

          {deployments.length > 0 && (
            <FadeIn delay={0.2}>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Récapitulatif
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-white/60 flex items-center gap-1.5">
                      <Phone className="w-3 h-3" />
                      Forfait de base
                    </span>
                    <p className="text-white font-semibold tabular-nums">
                      {totalBase.toFixed(2)} €
                    </p>
                    <p className="text-xs text-white/40">
                      {deployments.length} agent{deployments.length > 1 ? 's' : ''} ×{' '}
                      {BILLING.MONTHLY_BASE_PER_AGENT} €
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-white/60">Hors forfait</span>
                    <p
                      className={cn(
                        'font-semibold tabular-nums',
                        totalOverage > 0 ? 'text-orange-400' : 'text-white',
                      )}
                    >
                      {totalOverage.toFixed(2)} €
                    </p>
                    <p className="text-xs text-white/40">{BILLING.OVERAGE_RATE} €/min</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-white/60 flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3" />
                      SMS
                    </span>
                    <p className="text-white font-semibold tabular-nums">{totalSms.toFixed(2)} €</p>
                    <p className="text-xs text-white/40">
                      {deployments.reduce((s, d) => s + d.sms_count, 0)} SMS
                    </p>
                  </div>
                  <div className="space-y-1 bg-purple-500/10 rounded-lg p-3 -m-1">
                    <span className="text-xs text-purple-300">Total estimé</span>
                    <p className="text-xl font-bold text-white tabular-nums">
                      {totalCost.toFixed(2)} €
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}
        </>
      )}
    </div>
  )
}
