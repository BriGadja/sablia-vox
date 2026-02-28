'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Bot, Building2, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { useCurrentMonthBillingSummary } from '@/lib/hooks/useUserConsumption'
import type {
  AdminAgentBilling,
  AdminBillingSummaryResponse,
  AdminCompanyBilling,
} from '@/lib/types/consumption'

/**
 * PreviousMonthSummary Component
 *
 * Displays the previous month's billing summary for admins:
 * - KPI cards with totals
 * - Expandable table by company with agent breakdown
 *
 * SECURITY: Only visible to admins - contains margin data
 */
export function PreviousMonthSummary() {
  const { data, isLoading, error } = useCurrentMonthBillingSummary()

  if (error) {
    // Don't show error for access denied - just hide the component
    if (error.message.includes('Access denied')) {
      return null
    }
    return (
      <Card className="bg-zinc-900/50 border-white/10">
        <CardContent className="p-4">
          <p className="text-red-400 text-sm">Erreur: {error.message}</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return <PreviousMonthSkeleton />
  }

  if (!data?.previous_month) {
    return null
  }

  const { previous_month } = data
  const { period, totals, by_company } = previous_month

  // Format period display
  const periodLabel = format(new Date(period.start_date), 'MMMM yyyy', { locale: fr })

  return (
    <Card className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-white text-lg">Résumé Facturation - {periodLabel}</span>
          <span className="text-sm font-normal text-white/50">Mois précédent</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <KPICard
            label="Revenu Total"
            value={totals.total_revenue ?? 0}
            format="currency"
            highlight
          />
          <KPICard label="Leasing" value={totals.leasing_revenue ?? 0} format="currency" />
          <KPICard label="Consommation" value={totals.consumption_revenue ?? 0} format="currency" />
          <KPICard
            label="Coût Provider"
            value={totals.total_provider_cost ?? 0}
            format="currency"
            negative
          />
          <KPICard label="Marge" value={totals.total_margin ?? 0} format="currency" color="green" />
          <KPICard
            label="% Marge"
            value={totals.margin_percentage ?? 0}
            format="percentage"
            color="green"
          />
        </div>

        {/* Volume metrics */}
        <div className="flex gap-4 text-sm text-white/60">
          <span>{(totals.call_count ?? 0).toLocaleString('fr-FR')} appels</span>
          <span>{(totals.sms_count ?? 0).toLocaleString('fr-FR')} SMS</span>
          <span>{(totals.email_count ?? 0).toLocaleString('fr-FR')} emails</span>
        </div>

        {/* Company Breakdown Table */}
        {by_company && by_company.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-white/70 mb-2">Détail par entreprise</h4>
            <CompanyBreakdownTable companies={by_company} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

interface KPICardProps {
  label: string
  value: number
  format: 'currency' | 'percentage' | 'number'
  highlight?: boolean
  negative?: boolean
  color?: 'green' | 'red' | 'default'
}

function KPICard({ label, value, format, highlight, negative, color }: KPICardProps) {
  const formattedValue = useMemo(() => {
    switch (format) {
      case 'currency':
        return `${value.toFixed(2)} €`
      case 'percentage':
        return `${value.toFixed(1)}%`
      default:
        return value.toLocaleString('fr-FR')
    }
  }, [value, format])

  const textColor =
    color === 'green'
      ? 'text-green-400'
      : color === 'red'
        ? 'text-red-400'
        : negative
          ? 'text-orange-400'
          : highlight
            ? 'text-violet-300'
            : 'text-white'

  return (
    <div
      className={`p-3 rounded-lg ${highlight ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-white/5'}`}
    >
      <p className="text-xs text-white/50 mb-1 truncate">{label}</p>
      <p className={`text-lg font-semibold ${textColor}`}>{formattedValue}</p>
    </div>
  )
}

interface CompanyBreakdownTableProps {
  companies: AdminCompanyBilling[]
}

function CompanyBreakdownTable({ companies }: CompanyBreakdownTableProps) {
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set())

  const toggleCompany = (clientId: string) => {
    setExpandedCompanies((prev) => {
      const next = new Set(prev)
      if (next.has(clientId)) {
        next.delete(clientId)
      } else {
        next.add(clientId)
      }
      return next
    })
  }

  return (
    <div className="bg-zinc-900/50 rounded-lg border border-white/10 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-7 gap-2 px-4 py-2 bg-white/5 text-xs font-medium text-white/50 border-b border-white/10 sticky top-0">
        <div className="col-span-2">Entreprise / Agent</div>
        <div className="text-right">Leasing</div>
        <div className="text-right">Conso</div>
        <div className="text-right">Coût</div>
        <div className="text-right">Marge</div>
        <div className="text-right">%</div>
      </div>

      {/* Company Rows - scrollable */}
      <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
        {companies.map((company) => (
          <CompanyRow
            key={company.client_id}
            company={company}
            isExpanded={expandedCompanies.has(company.client_id)}
            onToggle={() => toggleCompany(company.client_id)}
          />
        ))}
      </div>
    </div>
  )
}

interface CompanyRowProps {
  company: AdminCompanyBilling
  isExpanded: boolean
  onToggle: () => void
}

function CompanyRow({ company, isExpanded, onToggle }: CompanyRowProps) {
  const hasAgents = company.agents && company.agents.length > 0

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      {/* Company Row */}
      <CollapsibleTrigger asChild>
        <div className="grid grid-cols-7 gap-2 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors group">
          <div className="col-span-2 flex items-center gap-2">
            {hasAgents && (
              <ChevronRight
                className={`h-4 w-4 text-white/40 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            )}
            <Building2 className="h-4 w-4 text-white/40" />
            <span className="text-sm font-medium text-white truncate">{company.client_name}</span>
          </div>
          <div className="text-right text-sm text-white/70">
            {(company.leasing_revenue ?? 0).toFixed(0)} €
          </div>
          <div className="text-right text-sm text-white/70">
            {(company.consumption_revenue ?? 0).toFixed(0)} €
          </div>
          <div className="text-right text-sm text-orange-400/80">
            {(company.total_provider_cost ?? 0).toFixed(0)} €
          </div>
          <div className="text-right text-sm text-green-400">
            {(company.total_margin ?? 0).toFixed(0)} €
          </div>
          <div className="text-right text-sm">
            <MarginBadge percentage={company.margin_percentage ?? 0} />
          </div>
        </div>
      </CollapsibleTrigger>

      {/* Agent Sub-rows */}
      {hasAgents && (
        <CollapsibleContent>
          <div className="bg-white/[0.02] border-t border-white/5">
            {company.agents.map((agent) => (
              <AgentRow key={agent.deployment_id} agent={agent} />
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}

interface AgentRowProps {
  agent: AdminAgentBilling
}

function AgentRow({ agent }: AgentRowProps) {
  // Calculate consumption revenue (total - leasing)
  const consumptionRevenue = agent.total_revenue - agent.leasing_revenue

  return (
    <div className="grid grid-cols-7 gap-2 px-4 py-2 pl-12 hover:bg-white/5 transition-colors">
      <div className="col-span-2 flex items-center gap-2">
        <Bot className="h-3 w-3 text-white/30" />
        <span className="text-sm text-white/60 truncate">{agent.deployment_name}</span>
        <span className="text-xs text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
          {agent.agent_type_name}
        </span>
      </div>
      <div className="text-right text-sm text-white/50">{agent.leasing_revenue.toFixed(0)} €</div>
      <div className="text-right text-sm text-white/50">{consumptionRevenue.toFixed(0)} €</div>
      <div className="text-right text-sm text-white/30">-</div>
      <div className="text-right text-sm text-green-400/70">{agent.total_margin.toFixed(0)} €</div>
      <div className="text-right text-sm">
        <MarginBadge percentage={agent.margin_percentage} small />
      </div>
    </div>
  )
}

interface MarginBadgeProps {
  percentage: number
  small?: boolean
}

function MarginBadge({ percentage, small }: MarginBadgeProps) {
  const isHigh = percentage >= 50
  const isMedium = percentage >= 30 && percentage < 50

  const bgColor = isHigh
    ? 'bg-green-500/20 text-green-400'
    : isMedium
      ? 'bg-yellow-500/20 text-yellow-400'
      : 'bg-red-500/20 text-red-400'

  return (
    <span
      className={`inline-block rounded px-1.5 ${bgColor} ${
        small ? 'text-xs py-0.5' : 'text-sm py-0.5'
      }`}
    >
      {percentage.toFixed(1)}%
    </span>
  )
}

function PreviousMonthSkeleton() {
  return (
    <Card className="bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/20 animate-pulse">
      <CardHeader className="pb-3">
        <div className="h-6 bg-white/10 rounded w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-lg" />
          ))}
        </div>
        <div className="h-4 bg-white/5 rounded w-48" />
        <div className="h-32 bg-white/5 rounded-lg" />
      </CardContent>
    </Card>
  )
}
