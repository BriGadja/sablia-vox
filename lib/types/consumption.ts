// Consumption Types - Dashboard Restructure V2
// Types pour le dashboard consommation utilisateur
// SECURITE: Ces types ne contiennent JAMAIS de donnees de marge

/**
 * Metriques de consommation pour la periode courante
 * NOTE: Ne contient PAS provider_cost, margin, margin_percentage
 */
export interface UserConsumptionPeriod {
  total_minutes: number
  total_seconds: number
  total_sms_segments: number
  total_emails: number
  total_calls: number
  answered_calls: number
  appointments_scheduled: number

  // Couts factures au client (PAS provider cost)
  total_cost: number // EUR
  call_cost: number // EUR
  sms_cost: number // EUR
  email_cost: number // EUR
}

/**
 * Informations de tarification visibles aux utilisateurs
 */
export interface UserPricingInfo {
  avg_price_per_minute: number // EUR
  avg_price_per_sms: number // EUR
  avg_price_per_email: number // EUR
}

/**
 * Consommation par agent pour les utilisateurs
 * NOTE: Ne contient PAS de donnees de marge
 */
export interface UserAgentConsumption {
  deployment_id: string
  deployment_name: string
  agent_type_name: string
  client_name: string
  total_minutes: number
  total_seconds: number
  total_sms_segments: number
  total_emails: number
  total_calls: number
  answered_calls: number
  appointments_scheduled: number
  total_cost: number // EUR - facture au client
  price_per_minute: number // EUR - depuis config deployment
  price_per_sms: number // EUR - depuis config deployment
  price_per_email: number // EUR - depuis config deployment
}

/**
 * Response de get_user_consumption_metrics()
 * SECURITE: Ne contient JAMAIS provider_cost, margin, margin_percentage
 */
export interface UserConsumptionResponse {
  current_period: UserConsumptionPeriod
  pricing: UserPricingInfo
  by_agent: UserAgentConsumption[]
}

/**
 * Filtres pour le dashboard consommation
 */
export interface ConsumptionFilters {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  clientId?: string | null
}

// ============================================================================
// Types Admin Billing (avec marge) - ADMIN ONLY
// ============================================================================

/**
 * Periode de facturation
 */
export interface BillingPeriod {
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
}

/**
 * Totaux de facturation admin (AVEC marge)
 * SECURITE: Uniquement pour les admins
 */
export interface AdminBillingTotals {
  total_revenue: number
  leasing_revenue: number
  call_revenue: number
  sms_revenue: number
  email_revenue: number
  total_provider_cost: number
  total_margin: number
  margin_percentage: number
  call_count: number
  sms_count: number
  email_count: number
  unique_clients: number
  unique_deployments: number
}

/**
 * Facturation par agent pour admin
 */
export interface AdminAgentBilling {
  deployment_id: string
  deployment_name: string
  agent_type_name: string
  total_revenue: number
  leasing_revenue: number
  call_revenue: number
  sms_revenue: number
  email_revenue: number
  total_margin: number
  margin_percentage: number
}

/**
 * Facturation par entreprise pour admin
 */
export interface AdminCompanyBilling {
  client_id: string
  client_name: string
  total_revenue: number
  leasing_revenue: number
  consumption_revenue: number
  total_provider_cost: number
  total_margin: number
  margin_percentage: number
  agents: AdminAgentBilling[]
}

/**
 * Donnees de facturation du mois
 */
export interface AdminMonthBilling {
  period: BillingPeriod
  totals: AdminBillingTotals
  by_company?: AdminCompanyBilling[]
}

/**
 * Totaux simplifies du mois precedent
 */
export interface AdminPreviousMonthTotals {
  total_revenue: number
  leasing_revenue: number
  consumption_revenue: number
  total_provider_cost: number
  total_margin: number
  margin_percentage: number
  call_count: number
  sms_count: number
  email_count: number
}

/**
 * Response de get_admin_billing_summary()
 * SECURITE: Uniquement pour les admins - contient toutes les donnees de marge
 */
export interface AdminBillingSummaryResponse {
  current_month: AdminMonthBilling
  previous_month: {
    period: BillingPeriod
    totals: AdminPreviousMonthTotals
    by_company?: AdminCompanyBilling[]
  }
}

// ============================================================================
// Types pour les graphiques du dashboard Ma Conso
// SECURITE: Ne contient JAMAIS de donnees de marge
// ============================================================================

/**
 * Donnees de consommation quotidienne pour le graphique d'evolution
 */
export interface DailyConsumption {
  date: string // YYYY-MM-DD
  call_cost: number // EUR - facture au client
  sms_cost: number // EUR - facture au client
  email_cost: number // EUR - facture au client
  total_minutes: number
  total_sms: number
  total_emails: number
}

/**
 * Repartition par canal pour le donut chart
 */
export interface ChannelBreakdown {
  calls: { volume: number; cost: number }
  sms: { volume: number; cost: number }
  emails: { volume: number; cost: number }
}

/**
 * Resume de consommation par agent pour le bar chart
 */
export interface AgentConsumptionSummary {
  deployment_id: string
  deployment_name: string
  agent_type: string
  total_cost: number // EUR - facture au client
  total_minutes: number
  total_sms: number
  total_emails: number
}

/**
 * Resume de consommation par client pour le bar chart
 * NOTE: Uniquement visible pour les admins, remplace par monthly_history pour les utilisateurs
 */
export interface ClientConsumptionSummary {
  client_id: string
  client_name: string
  total_cost: number // EUR - facture au client
}

/**
 * Historique mensuel de consommation (dernieres 6 mois)
 * Remplace by_client pour les utilisateurs non-admin
 */
export interface MonthlyConsumptionHistory {
  month: string // YYYY-MM
  month_label: string // "Dec 2025", "Nov 2025", etc.
  total_cost: number // EUR - facture au client
  call_cost: number // EUR
  sms_cost: number // EUR
  email_cost: number // EUR
  total_calls: number
  total_minutes: number
  total_sms: number
  total_emails: number
}

/**
 * Response de get_consumption_chart_data()
 * SECURITE: Ne contient JAMAIS provider_cost, margin, margin_percentage
 */
export interface ConsumptionChartData {
  daily_consumption: DailyConsumption[]
  by_channel: ChannelBreakdown
  by_agent: AgentConsumptionSummary[]
  monthly_history: MonthlyConsumptionHistory[] // Remplace by_client
}
