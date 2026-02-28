// Financial Dashboard Types
// Generated: 2025-01-16

// ============================================================================
// KPI Metrics Types
// ============================================================================

export interface FinancialKPIMetrics {
  total_revenue: number
  total_provider_cost: number
  total_margin: number
  margin_percentage: number
  call_revenue: number
  sms_revenue: number
  email_revenue: number
  leasing_revenue: number
  call_provider_cost: number
  sms_provider_cost: number
  email_provider_cost: number
  call_count: number
  answered_calls: number
  appointments_scheduled: number
  sms_count: number
  email_count: number
  unique_clients: number
  unique_deployments: number
  avg_revenue_per_client: number
  avg_margin_per_client: number
}

export interface FinancialPeriodInfo {
  start_date: string
  end_date: string
  duration_days: number
  previous_start_date: string
  previous_end_date: string
}

export interface FinancialComparison {
  revenue_change: number
  revenue_change_percentage: number
  margin_change: number
  margin_change_percentage: number
}

export interface FinancialKPIResponse {
  current_period: FinancialKPIMetrics
  previous_period: Pick<
    FinancialKPIMetrics,
    'total_revenue' | 'total_provider_cost' | 'total_margin' | 'margin_percentage'
  >
  period_info: FinancialPeriodInfo
  comparison: FinancialComparison
}

// ============================================================================
// Drilldown Types
// ============================================================================

export interface ClientFinancialData {
  client_id: string
  client_name: string
  total_revenue: number
  total_provider_cost: number
  total_margin: number
  margin_percentage: number
  call_revenue: number
  sms_revenue: number
  email_revenue: number
  leasing_revenue: number
  call_count: number
  sms_count: number
  email_count: number
  answered_calls: number
  appointments_scheduled: number
  unique_deployments: number
  active_days: number
}

export interface AgentTypeFinancialData {
  agent_type_id: string
  agent_type_name: string
  total_revenue: number
  total_provider_cost: number
  total_margin: number
  margin_percentage: number
  call_revenue: number
  sms_revenue: number
  email_revenue: number
  leasing_revenue: number
  call_count: number
  sms_count: number
  email_count: number
  answered_calls: number
  appointments_scheduled: number
  unique_clients: number
  unique_deployments: number
}

export interface DeploymentFinancialData {
  deployment_id: string
  client_id: string
  client_name: string
  agent_type_id: string
  agent_type_name: string
  total_revenue: number
  total_provider_cost: number
  total_margin: number
  margin_percentage: number
  call_revenue: number
  sms_revenue: number
  email_revenue: number
  leasing_revenue: number
  call_count: number
  sms_count: number
  email_count: number
  answered_calls: number
  appointments_scheduled: number
  active_days: number
}

// Deployment breakdown for a specific client (from get_client_deployments_breakdown)
export interface ClientDeploymentData {
  deployment_id: string
  deployment_name: string
  agent_type_name: string
  agent_type_label: string
  status: string
  created_at: string
  total_revenue: number
  total_provider_cost: number
  total_margin: number
  margin_percentage: number
  call_count: number
  sms_count: number
  email_count: number
  answered_calls: number
  appointments_scheduled: number
  answer_rate: number
  conversion_rate: number
  call_cost: number
  sms_cost: number
  email_cost: number
  leasing_revenue: number
  avg_call_duration: number
  cost_per_call: number
  cost_per_appointment: number
}

export interface ChannelFinancialData {
  channel_name: 'calls' | 'sms' | 'email' | 'leasing'
  revenue: number
  provider_cost: number
  margin: number
  margin_percentage: number
  volume: number
  answered?: number // For calls
  delivered?: number // For SMS/email
  description?: string // For leasing
}

export interface ChannelDrilldownResponse {
  channels: ChannelFinancialData[]
}

// Deployment channel breakdown (from get_deployment_channels_breakdown)
export interface DeploymentChannelData {
  channel_name: 'calls' | 'sms' | 'email' | 'leasing'
  channel_label: string
  channel_icon: string
  revenue: number
  provider_cost: number
  margin: number
  margin_percentage: number
  volume: number
  answered_calls: number | null
  appointments: number | null
  avg_duration: number | null
  answer_rate: number | null
  cost_per_item: number
  revenue_per_item: number
}

export type DrilldownLevel = 'client' | 'agent_type' | 'deployment' | 'channel'

export type DrilldownData =
  | ClientFinancialData[]
  | AgentTypeFinancialData[]
  | DeploymentFinancialData[]
  | ChannelDrilldownResponse

// ============================================================================
// Filter Types
// ============================================================================

export interface FinancialFilters {
  startDate: string
  endDate: string
  clientId?: string | null
  agentTypeName?: 'louis' | 'arthur' | 'alexandra' | null
  deploymentId?: string | null
}

// ============================================================================
// Chart Data Types
// ============================================================================

export interface TrendDataPoint {
  date: string
  revenue: number
  cost: number
  margin: number
  margin_percentage: number
}

export interface RevenueByChannelData {
  channel: string
  revenue: number
  percentage: number
}

export interface MarginByClientData {
  client_name: string
  margin: number
  margin_percentage: number
  revenue: number
}

// ============================================================================
// Time Series Types
// ============================================================================

export interface TimeSeriesRevenue {
  total: number
  calls: number
  sms: number
  email: number
  leasing: number
}

export interface TimeSeriesCost {
  total: number
  calls: number
  sms: number
  email: number
}

export interface TimeSeriesMargin {
  total: number
  percentage: number
}

export interface TimeSeriesVolume {
  calls: number
  answered_calls: number
  sms: number
  email: number
  appointments: number
}

export interface TimeSeriesMetrics {
  unique_clients: number
  unique_deployments: number
  answer_rate: number
  conversion_rate: number
}

export interface TimeSeriesDataPoint {
  date: string
  revenue: TimeSeriesRevenue
  cost: TimeSeriesCost
  margin: TimeSeriesMargin
  volume: TimeSeriesVolume
  metrics: TimeSeriesMetrics
}

export type TimeSeriesGranularity = 'day' | 'week' | 'month'

export interface TimeSeriesFilters extends FinancialFilters {
  granularity?: TimeSeriesGranularity
}

export interface TimeSeriesResponse {
  data: TimeSeriesDataPoint[]
  granularity: TimeSeriesGranularity
  period: {
    start: string
    end: string
  }
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface FinancialKPICardProps {
  title: string
  value: number | string
  previousValue?: number
  changePercentage?: number
  prefix?: string
  suffix?: string
  format?: 'currency' | 'percentage' | 'number'
  icon?: React.ComponentType<{ className?: string }>
  color?: string
  isLoading?: boolean
}

export interface FinancialChartProps {
  data: Record<string, unknown>[]
  isLoading?: boolean
  title?: string
  height?: number
}

export interface DrilldownTableProps {
  level: DrilldownLevel
  data: DrilldownData
  isLoading?: boolean
  onDrillDown?: (item: Record<string, unknown>) => void
}

// ============================================================================
// Cost Breakdown Types
// ============================================================================

export interface CallCosts {
  total: number
  stt: number
  tts: number
  llm: number
  telecom: number
  dipler_commission: number
}

export interface SMSCosts {
  total: number
}

export interface EmailCosts {
  total: number
}

export interface TotalCosts {
  provider_cost: number
  stt: number
  tts: number
  llm: number
  telecom: number
  dipler_commission: number
  all_channels: number
}

export interface CostVolume {
  calls: number
  sms: number
  emails: number
}

export interface CostBreakdownResponse {
  call_costs: CallCosts
  sms_costs: SMSCosts
  email_costs: EmailCosts
  total_costs: TotalCosts
  volume: CostVolume
}

export interface CostBreakdownChartDataPoint {
  name: string
  value: number
  percentage: number
  color: string
  [key: string]: string | number // Index signature for Recharts compatibility
}

// ============================================================================
// Leasing vs Consumption Separation Types (v2)
// Added: 2025-01-18
// ============================================================================

// Leasing-specific KPI metrics
export interface LeasingMetrics {
  total_leasing_revenue: number
  active_leasing_count: number
  avg_leasing_per_client: number
  mrr: number // Monthly Recurring Revenue
  avg_monthly_leasing: number
  leasing_client_count: number
  leasing_adoption_rate: number
  total_leasing_margin: number
  leasing_margin_pct: number // Always 100% for leasing
}

// Consumption-specific KPI metrics
export interface ConsumptionMetrics {
  // Revenue & Margin
  total_consumption_revenue: number
  total_provider_cost: number
  total_consumption_margin: number
  consumption_margin_pct: number

  // Volume metrics
  total_calls: number
  total_sms: number
  total_emails: number
  total_answered_calls: number
  total_appointments: number

  // Breakdown by channel
  call_revenue: number
  call_provider_cost: number
  call_margin: number
  call_margin_pct: number

  sms_revenue: number
  sms_provider_cost: number
  sms_margin: number
  sms_margin_pct: number

  email_revenue: number
  email_provider_cost: number
  email_margin: number
  email_margin_pct: number

  // Unit pricing (average across all agents)
  avg_cost_per_minute: number
  avg_cost_per_sms: number
  avg_cost_per_email: number
  avg_revenue_per_minute: number
  avg_revenue_per_sms: number
  avg_revenue_per_email: number

  // Business metrics
  avg_consumption_per_client: number
  consumption_client_count: number
  active_deployment_count: number
}

// Unit pricing metrics for a specific agent deployment
export interface AgentChannelMetrics {
  // Volumes
  total_calls?: number
  answered_calls?: number
  total_minutes?: number
  total_sms_sent?: number
  sms_delivered?: number
  total_emails_sent?: number
  emails_delivered?: number

  // Unit costs (provider)
  cost_per_minute_provider?: number
  cost_per_sms_provider?: number
  cost_per_email_provider?: number

  // Unit prices (charged to client)
  price_per_minute_charged?: number
  price_per_sms_charged?: number
  price_per_email_charged?: number

  // Unit margins
  margin_per_minute?: number
  margin_per_sms?: number
  margin_per_email?: number

  // Margin percentages
  margin_pct_calls?: number
  margin_pct_sms?: number
  margin_pct_emails?: number

  // Totals
  total_call_revenue?: number
  total_call_cost?: number
  total_call_margin?: number

  total_sms_revenue?: number
  total_sms_cost?: number
  total_sms_margin?: number

  total_email_revenue?: number
  total_email_cost?: number
  total_email_margin?: number
}

export interface AgentTotalConsumption {
  total_consumption_revenue: number
  total_consumption_cost: number
  total_consumption_margin: number
  consumption_margin_pct: number
}

export interface AgentUnitPricing {
  // Identification
  deployment_id: string
  deployment_name: string
  client_name: string
  agent_type_name: string
  agent_type_label: string
  status: string

  // Channel-specific metrics
  call_metrics: AgentChannelMetrics
  sms_metrics: AgentChannelMetrics
  email_metrics: AgentChannelMetrics

  // Total consumption (excluding leasing)
  total_consumption: AgentTotalConsumption
}

// Response type from get_consumption_pricing_by_agent
export interface ConsumptionPricingResponse {
  agents: AgentUnitPricing[]
}

// View mode for dashboard toggle
export type FinancialViewMode = 'leasing' | 'consumption'

// Props for FinancialViewToggle component
export interface FinancialViewToggleProps {
  mode: FinancialViewMode
  onModeChange: (mode: FinancialViewMode) => void
}

// Extended ClientDeploymentData with unit pricing
export interface ClientDeploymentDataV2 extends ClientDeploymentData {
  // Unit pricing for calls
  cost_per_minute_provider?: number
  price_per_minute_charged?: number
  margin_per_minute?: number

  // Unit pricing for SMS
  cost_per_sms_provider?: number
  price_per_sms_charged?: number
  margin_per_sms?: number

  // Unit pricing for emails
  cost_per_email_provider?: number
  price_per_email_charged?: number
  margin_per_email?: number

  // Separated revenues
  consumption_revenue?: number
  consumption_margin?: number
  consumption_margin_pct?: number
}
