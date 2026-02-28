'use client'

import { Bot, Building2, ChevronRight, FileText, Mail, MessageSquare, Phone } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type {
  ClientInvoice,
  DeploymentInvoice,
  InvoiceLine,
  InvoiceSummaryTableProps,
} from '@/lib/types/invoice'
import { formatCurrency } from '@/lib/types/invoice'

/**
 * Tableau de facturation mensuel
 *
 * Affiche:
 * 1. Un résumé global avec KPIs
 * 2. Un tableau récapitulatif par client
 * 3. Un détail expandable par client avec les lignes de facturation
 */
export function InvoiceSummaryTable({ data, isLoading, error }: InvoiceSummaryTableProps) {
  if (error) {
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
    return <InvoiceTableSkeleton />
  }

  if (!data || !data.clients || data.clients.length === 0) {
    return (
      <Card className="bg-zinc-900/50 border-white/10">
        <CardContent className="p-6 text-center">
          <FileText className="h-8 w-8 text-white/30 mx-auto mb-2" />
          <p className="text-white/50 text-sm">Aucune donnée de facturation pour cette période</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border-emerald-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-white text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            Résumé Facturation
          </span>
          <span className="text-sm font-normal text-white/50 capitalize">{data.period.label}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPI Summary */}
        <SummaryKPIs summary={data.summary} />

        {/* Table */}
        <ClientSummaryTable clients={data.clients} />
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

interface SummaryKPIsProps {
  summary: {
    total_leasing: number
    total_consumption: number
    total_invoice: number
    total_clients: number
  }
}

function SummaryKPIs({ summary }: SummaryKPIsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPICard label="Total à facturer" value={summary.total_invoice} format="currency" highlight />
      <KPICard
        label="Leasing"
        value={summary.total_leasing}
        format="currency"
        icon={<Building2 className="h-4 w-4" />}
      />
      <KPICard
        label="Consommation"
        value={summary.total_consumption}
        format="currency"
        icon={<Phone className="h-4 w-4" />}
      />
      <KPICard
        label="Clients actifs"
        value={summary.total_clients}
        format="number"
        icon={<Building2 className="h-4 w-4" />}
      />
    </div>
  )
}

interface KPICardProps {
  label: string
  value: number
  format: 'currency' | 'number'
  highlight?: boolean
  icon?: React.ReactNode
}

function KPICard({ label, value, format, highlight, icon }: KPICardProps) {
  const formattedValue = useMemo(() => {
    if (format === 'currency') {
      return formatCurrency(value)
    }
    return value.toLocaleString('fr-FR')
  }, [value, format])

  return (
    <div
      className={`p-3 rounded-lg ${highlight ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5'}`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {icon && <span className="text-white/40">{icon}</span>}
        <p className="text-xs text-white/50 truncate">{label}</p>
      </div>
      <p className={`text-lg font-semibold ${highlight ? 'text-emerald-400' : 'text-white'}`}>
        {formattedValue}
      </p>
    </div>
  )
}

interface ClientSummaryTableProps {
  clients: ClientInvoice[]
}

function ClientSummaryTable({ clients }: ClientSummaryTableProps) {
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())

  const toggleClient = (clientId: string) => {
    setExpandedClients((prev) => {
      const next = new Set(prev)
      if (next.has(clientId)) {
        next.delete(clientId)
      } else {
        next.add(clientId)
      }
      return next
    })
  }

  // Calculer les totaux
  const totals = useMemo(
    () => ({
      leasing: clients.reduce((sum, c) => sum + c.total_leasing, 0),
      consumption: clients.reduce((sum, c) => sum + c.total_consumption, 0),
      total: clients.reduce((sum, c) => sum + c.total_client, 0),
    }),
    [clients],
  )

  return (
    <div className="bg-zinc-900/50 rounded-lg border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-5 gap-2 px-4 py-2 bg-white/5 text-xs font-medium text-white/50 border-b border-white/10">
        <div className="col-span-2">Client</div>
        <div className="text-right">Leasing</div>
        <div className="text-right">Conso</div>
        <div className="text-right">Total HT</div>
      </div>

      {/* Client Rows */}
      <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
        {clients.map((client) => (
          <ClientRow
            key={client.client_id}
            client={client}
            isExpanded={expandedClients.has(client.client_id)}
            onToggle={() => toggleClient(client.client_id)}
          />
        ))}
      </div>

      {/* Footer - Totals */}
      <div className="grid grid-cols-5 gap-2 px-4 py-3 bg-emerald-500/10 border-t border-emerald-500/20 text-sm font-semibold">
        <div className="col-span-2 text-white">TOTAL</div>
        <div className="text-right text-white/80">{formatCurrency(totals.leasing)}</div>
        <div className="text-right text-white/80">{formatCurrency(totals.consumption)}</div>
        <div className="text-right text-emerald-400">{formatCurrency(totals.total)}</div>
      </div>
    </div>
  )
}

interface ClientRowProps {
  client: ClientInvoice
  isExpanded: boolean
  onToggle: () => void
}

function ClientRow({ client, isExpanded, onToggle }: ClientRowProps) {
  const hasDeployments = client.deployments && client.deployments.length > 0

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      {/* Client Summary Row */}
      <CollapsibleTrigger asChild>
        <div className="grid grid-cols-5 gap-2 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors group">
          <div className="col-span-2 flex items-center gap-2">
            {hasDeployments && (
              <ChevronRight
                className={`h-4 w-4 text-white/40 transition-transform ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            )}
            <Building2 className="h-4 w-4 text-white/40" />
            <span className="text-sm font-medium text-white truncate">{client.client_name}</span>
          </div>
          <div className="text-right text-sm text-white/70">
            {formatCurrency(client.total_leasing)}
          </div>
          <div className="text-right text-sm text-white/70">
            {formatCurrency(client.total_consumption)}
          </div>
          <div className="text-right text-sm font-semibold text-emerald-400">
            {formatCurrency(client.total_client)}
          </div>
        </div>
      </CollapsibleTrigger>

      {/* Deployment Details */}
      {hasDeployments && (
        <CollapsibleContent>
          <div className="bg-white/[0.02] border-t border-white/5">
            {client.deployments.map((deployment) => (
              <DeploymentDetail key={deployment.deployment_id} deployment={deployment} />
            ))}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  )
}

interface DeploymentDetailProps {
  deployment: DeploymentInvoice
}

function DeploymentDetail({ deployment }: DeploymentDetailProps) {
  return (
    <div className="px-4 py-3 pl-12 border-b border-white/5 last:border-b-0">
      {/* Deployment Header */}
      <div className="flex items-center gap-2 mb-2">
        <Bot className="h-3 w-3 text-white/30" />
        <span className="text-sm text-white/80">{deployment.deployment_name}</span>
        <span className="text-xs text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
          {deployment.agent_type}
        </span>
        {deployment.is_first_month && (
          <span className="text-xs text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded">
            Prorata
          </span>
        )}
      </div>

      {/* Invoice Lines */}
      <div className="space-y-1 ml-5">
        {deployment.lines.map((line, index) => (
          <InvoiceLineRow key={`${deployment.deployment_id}-${index}`} line={line} />
        ))}

        {/* Subtotal */}
        <div className="flex justify-between items-center pt-1 mt-1 border-t border-white/5">
          <span className="text-xs text-white/40">Sous-total</span>
          <span className="text-sm font-medium text-white/80">
            {formatCurrency(deployment.subtotal)}
          </span>
        </div>
      </div>
    </div>
  )
}

interface InvoiceLineRowProps {
  line: InvoiceLine
}

function InvoiceLineRow({ line }: InvoiceLineRowProps) {
  const icon = useMemo(() => {
    switch (line.type) {
      case 'leasing':
        return <Building2 className="h-3 w-3" />
      case 'calls':
        return <Phone className="h-3 w-3" />
      case 'sms':
        return <MessageSquare className="h-3 w-3" />
      case 'emails':
        return <Mail className="h-3 w-3" />
      default:
        return null
    }
  }, [line.type])

  return (
    <div className="grid grid-cols-12 gap-2 text-xs text-white/60 py-0.5">
      <div className="col-span-5 flex items-center gap-1.5">
        <span className="text-white/30">{icon}</span>
        <span>{line.description}</span>
      </div>
      <div className="col-span-2 text-right">
        {line.quantity.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} {line.unit}
      </div>
      <div className="col-span-2 text-right text-white/40">
        {formatCurrency(line.unit_price)}/{line.unit}
      </div>
      <div className="col-span-3 text-right text-white/80">{formatCurrency(line.amount)}</div>
    </div>
  )
}

function InvoiceTableSkeleton() {
  return (
    <Card className="bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border-emerald-500/20 animate-pulse">
      <CardHeader className="pb-3">
        <div className="h-6 bg-white/10 rounded w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-white/5 rounded-lg" />
      </CardContent>
    </Card>
  )
}

export default InvoiceSummaryTable
