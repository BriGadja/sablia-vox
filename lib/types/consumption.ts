export interface DeploymentConsumption {
  deployment_id: string
  agent_name: string
  template_type: string
  org_id: string
  org_name: string
  is_internal: boolean
  billing_client_name: string | null
  call_count: number
  answered_calls?: number
  total_seconds: number
  total_minutes: number
  billed_call_cost: number
  sms_count: number
  sms_cost: number
  email_count?: number
  email_cost?: number
  cost_per_min: number | null
  cost_per_sms: number | null
}

export interface ConsumptionMetrics {
  period: { start: string; end: string }
  by_deployment: DeploymentConsumption[]
}

export type MonthPreset = 'current' | 'previous' | 'custom'

export interface ConsumptionFilters {
  startDate: string
  endDate: string
  clientsOnly: boolean
  month?: MonthPreset
}

export const BILLING = {
  MONTHLY_BASE_PER_AGENT: 300,
  INCLUDED_MINUTES: 100,
  OVERAGE_RATE: 0.27,
  SMS_RATE: 0.14,
} as const
